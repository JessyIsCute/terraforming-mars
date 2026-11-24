import {expect} from 'chai';
import {CardType} from '../../src/common/cards/CardType';
import {Tag} from '../../src/common/cards/Tag';
import {CardName} from '../../src/common/cards/CardName';
import {Game} from '../../src/server/Game';
import {IGame} from '../../src/server/IGame';
import {AssembledCardDefinition} from '../../src/server/assembler/AssembledCardDefinition';
import {AssemblerExpansion} from '../../src/server/assembler/AssemblerExpansion';
import {newAssembledCard} from '../../src/server/assembler/AssembledCard';
import {getAssembledCardDefinition, registerAssembledCard, unregisterAssembledCards} from '../../src/server/assembler/AssembledCardRegistry';
import {getBehaviorExecutor} from '../../src/server/behavior/BehaviorExecutor';
import {newProjectCard} from '../../src/server/createCard';
import {cardsToModel} from '../../src/server/models/ModelUtils';
import {isIActionCard} from '../../src/server/cards/ICard';
import {Research} from '../../src/server/cards/base/Research';
import {Mine} from '../../src/server/cards/base/Mine';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {runAllActions} from '../TestingUtils';

let serial = 0;
/** A hand-built definition, so each mechanism can be tested on its own. */
function definition(overrides: Partial<AssembledCardDefinition>): AssembledCardDefinition {
  serial++;
  const def: AssembledCardDefinition = {
    name: `Assembled unit-test-${serial}`,
    title: 'Test Contraption',
    complexity: 'low',
    type: CardType.AUTOMATED,
    cost: 5,
    tags: [Tag.BUILDING],
    requirements: [],
    description: '',
    effectTexts: [],
    value: 8,
    breakdown: [],
    ...overrides,
  };
  registerAssembledCard(def);
  return def;
}

describe('AssemblerExpansion', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2);
  });

  it('assemble shuffles new cards into the deck and remembers them', () => {
    const before = game.projectDeck.drawPile.length;
    const cards = AssemblerExpansion.assemble(game, 3, player);
    expect(game.projectDeck.drawPile).has.length(before + 3);
    expect(game.assembledCards).has.length(3);
    for (const card of cards) {
      expect(game.projectDeck.drawPile).includes(card);
      expect(getAssembledCardDefinition(card.name)).is.not.undefined;
    }
    // names are unique and carry the game id
    const names = game.assembledCards.map((d) => d.name);
    expect(new Set(names).size).eq(3);
    expect(names[0]).eq(`Assembled ${game.id}-1`);
  });

  it('the assemble behavior keyword works through the behavior executor', () => {
    const before = game.projectDeck.drawPile.length;
    getBehaviorExecutor().execute({assemble: 2}, player, new Mine());
    expect(game.projectDeck.drawPile).has.length(before + 2);
    expect(game.assembledCards).has.length(2);
  });

  it('assembled cards survive save and load, even in a fresh server process', () => {
    const [card] = AssemblerExpansion.assemble(game, 1);
    // move it from the deck into the player's hand
    game.projectDeck.drawPile.splice(game.projectDeck.drawPile.indexOf(card), 1);
    player.cardsInHand.push(card);
    const deckNames = game.projectDeck.drawPile.map((c) => c.name);

    const serialized = JSON.parse(JSON.stringify((game as Game).serialize()));
    // simulate a restarted server: nothing knows the card any more
    unregisterAssembledCards(game.assembledCards.map((d) => d.name));
    expect(newProjectCard(card.name)).is.undefined;

    const loaded = Game.deserialize(serialized);
    const loadedPlayer = loaded.getPlayerById(player.id);
    const inHand = loadedPlayer.cardsInHand.find((c) => c.name === card.name);
    expect(inHand).is.not.undefined;
    expect(inHand!.cost).eq(card.cost);
    expect(inHand!.tags).deep.eq(card.tags);
    expect(loaded.projectDeck.drawPile.map((c) => c.name)).deep.eq(deckNames);
    expect(loaded.assembledCards).deep.eq(JSON.parse(JSON.stringify(game.assembledCards)));
  });

  it('a game that never assembled saves no assembledCards field', () => {
    expect((game as Game).serialize().assembledCards).is.undefined;
  });

  it('playing an assembled card runs its behavior and scores its VP', () => {
    const def = definition({behavior: {production: {plants: 1}, stock: {steel: 2}}, victoryPoints: 1});
    const card = newAssembledCard(def);
    player.playCard(card);
    runAllActions(game);
    expect(player.production.plants).eq(1);
    expect(player.steel).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('lose takes what it can and never blocks the card', () => {
    const def = definition({behavior: {stock: {megacredits: 5}, lose: {stock: {plants: 3}}}});
    const card = newAssembledCard(def);
    player.plants = 1;
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    runAllActions(game);
    expect(player.plants).eq(0);
  });

  it('negative production makes the card unplayable when you lack it', () => {
    const def = definition({behavior: {production: {energy: -1, megacredits: 3}}});
    const card = newAssembledCard(def);
    player.production.override({energy: 0});
    expect(card.canPlay(player)).is.false;
    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
  });

  it('an action card acts', () => {
    const def = definition({type: CardType.ACTIVE, action: {spend: {energy: 2}, stock: {steel: 2}}});
    const card = newAssembledCard(def);
    expect(isIActionCard(card)).is.true;
    if (!isIActionCard(card)) {
      return;
    }
    player.energy = 1;
    expect(card.canAct(player)).is.false;
    player.energy = 2;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(player.energy).eq(0);
    expect(player.steel).eq(2);
  });

  it('a card without an action is not an action card', () => {
    expect(isIActionCard(newAssembledCard(definition({behavior: {stock: {heat: 2}}})))).is.false;
  });

  it('discounts and penalties change card costs', () => {
    const research = new Research(); // science + science, cost 11
    player.playedCards.push(newAssembledCard(definition({type: CardType.ACTIVE, cardDiscount: [{amount: 2}]})));
    expect(player.getCardCost(research)).eq(9);
    player.playedCards.push(newAssembledCard(definition({type: CardType.ACTIVE, cardDiscount: [{tag: Tag.SCIENCE, amount: -1}]})));
    // -1 per science tag: Research has 2
    expect(player.getCardCost(research)).eq(11);
  });

  it('a trigger pays out when you play a matching tag', () => {
    player.playedCards.push(newAssembledCard(definition({type: CardType.ACTIVE, trigger: {tag: Tag.SCIENCE, gain: {megacredits: 2}}})));
    player.playCard(new Mine());
    expect(player.megaCredits).eq(0);
    player.playCard(new Research());
    expect(player.megaCredits).eq(2);
  });

  it('the client model carries the card face and title', () => {
    const def = definition({title: 'Modular Foundry', type: CardType.ACTIVE, action: {stock: {steel: 1}}});
    const [model] = cardsToModel(player, [newAssembledCard(def)]);
    expect(model.customCard).is.not.undefined;
    expect(model.customCard!.cost).eq(def.cost);
    expect(model.customCard!.hasAction).is.true;
    expect(model.combinedDisplayName).eq('Modular Foundry');
  });

  it('createCard finds registered assembled cards by name', () => {
    const def = definition({});
    expect(newProjectCard(def.name as CardName)?.name).eq(def.name);
  });
});
