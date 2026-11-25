import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {Tag} from '../../../src/common/cards/Tag';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {getAssembledCardDefinition, isAssembledCardName} from '../../../src/server/assembler/AssembledCardRegistry';
import {AssemblerExpansion} from '../../../src/server/assembler/AssemblerExpansion';
import {ResearchPrototype} from '../../../src/server/cards/assembler/ResearchPrototype';
import {OpenSourceBlueprints} from '../../../src/server/cards/assembler/OpenSourceBlueprints';
import {QuadCoreChassis} from '../../../src/server/cards/assembler/QuadCoreChassis';
import {AssemblyRobots} from '../../../src/server/cards/assembler/AssemblyRobots';
import {ReverseEngineering} from '../../../src/server/cards/assembler/ReverseEngineering';
import {SpecializedFabricator} from '../../../src/server/cards/assembler/SpecializedFabricator';
import {VenturePrototype} from '../../../src/server/cards/assembler/VenturePrototype';
import {ProductionRun} from '../../../src/server/cards/assembler/ProductionRun';
import {HallOfPrototypes} from '../../../src/server/cards/assembler/HallOfPrototypes';
import {BargainBin} from '../../../src/server/cards/assembler/BargainBin';
import {Research} from '../../../src/server/cards/base/Research';
import {Mine} from '../../../src/server/cards/base/Mine';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';

function definitionOf(card: IProjectCard) {
  const def = getAssembledCardDefinition(card.name);
  expect(def, card.name).is.not.undefined;
  return def!;
}

function assembledInHand(player: TestPlayer) {
  return player.cardsInHand.filter((c) => isAssembledCardName(c.name));
}

describe('Assembler card pack', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {assemblerExpansion: true});
  });

  it('Research Prototype: a science-tagged card into your hand, then discard a card', () => {
    const kept = new Mine();
    player.cardsInHand.push(kept);
    player.playCard(new ResearchPrototype());
    game.deferredActions.runNext(); // the discard prompt
    const [assembled] = assembledInHand(player);
    expect(definitionOf(assembled).tags).includes(Tag.SCIENCE);

    const discard = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    discard.cb([kept]);
    expect(player.cardsInHand).deep.eq([assembled]);
  });

  it('Open Source Blueprints: everyone gets a simple ~30 M€ card, yours 10 M€ cheaper', () => {
    player.playCard(new OpenSourceBlueprints());
    runAllActions(game);

    const [mine] = assembledInHand(player);
    const [theirs] = assembledInHand(player2);
    const myDef = definitionOf(mine);
    const theirDef = definitionOf(theirs);

    // Several benefits, no effects or drawbacks: more than complexity 1.
    expect(theirDef.complexity).gt(1);
    expect(theirDef.effectTexts).is.empty;
    expect(theirDef.cost).is.within(28, 32);
    expect(theirDef.costAdjust).is.undefined;

    expect(myDef.effectTexts).is.empty;
    expect(myDef.costAdjust).eq(-10);
    expect(myDef.cost).is.within(18, 22);
    expect(mine.cost).eq(myDef.cost);
  });

  it('Quad-Core Chassis: a card with exactly 4 tags', () => {
    player.playCard(new QuadCoreChassis());
    runAllActions(game);
    const [assembled] = assembledInHand(player);
    expect(assembled.tags).has.length(4);
  });

  it('Assembly Robots: assembled cards cost 2 M€ less, other cards do not', () => {
    const robots = new AssemblyRobots();
    player.playCard(robots);
    runAllActions(game);
    const [assembled] = assembledInHand(player);

    expect(player.getCardCost(assembled)).eq(Math.max(0, assembled.cost - 2));
    const research = new Research();
    expect(player.getCardCost(research)).eq(research.cost);
  });

  it('Reverse Engineering: discard a card to assemble one', () => {
    const card = new ReverseEngineering();
    expect(card.canAct(player)).is.false;

    const old = new Mine();
    player.cardsInHand.push(old);
    expect(card.canAct(player)).is.true;

    card.action(player);
    // only one card in hand, so it's discarded without asking
    runAllActions(game);
    expect(player.cardsInHand).does.not.include(old);
    expect(assembledInHand(player)).has.length(1);
  });

  it('Specialized Fabricator: the new card carries your most common tag', () => {
    player.tagsForTest = {jovian: 3, science: 1};
    expect(SpecializedFabricator.mostCommonTag(player)).eq(Tag.JOVIAN);
    player.playCard(new SpecializedFabricator());
    runAllActions(game);
    const [assembled] = assembledInHand(player);
    expect(assembled.tags).includes(Tag.JOVIAN);
  });

  it('Specialized Fabricator: with no tags yet, any card', () => {
    expect(SpecializedFabricator.mostCommonTag(player)).is.undefined;
    player.playCard(new SpecializedFabricator());
    runAllActions(game);
    expect(assembledInHand(player)).has.length(1);
  });

  it('Venture Prototype: a card of complexity 5 or more and 1 titanium', () => {
    player.playCard(new VenturePrototype());
    runAllActions(game);
    const [assembled] = assembledInHand(player);
    expect(definitionOf(assembled).complexity).gte(5);
    expect(player.titanium).eq(1);
  });

  it('Production Run: energy production, 1 card into your hand, 2 into the deck', () => {
    const deckSize = game.projectDeck.drawPile.length;
    player.playCard(new ProductionRun());
    runAllActions(game);
    expect(player.production.energy).eq(1);
    expect(assembledInHand(player)).has.length(1);
    expect(game.projectDeck.drawPile).has.length(deckSize + 2);
  });

  it('Hall of Prototypes: 1 VP per 2 assembled cards played, events included', () => {
    const hall = new HallOfPrototypes();
    player.playCard(hall);
    expect(hall.getVictoryPoints(player)).eq(0);

    const cards = AssemblerExpansion.assembleIntoHand(player, 3);
    for (const c of cards) {
      player.playCard(c);
    }
    runAllActions(game);
    expect(HallOfPrototypes.assembledPlayed(player)).eq(3);
    expect(hall.getVictoryPoints(player)).eq(1);
  });

  it('Bargain Bin: a simple card costing at most 8 M€, and 2 M€', () => {
    player.megaCredits = 0;
    player.playCard(new BargainBin());
    runAllActions(game);
    const [assembled] = assembledInHand(player);
    const def = definitionOf(assembled);
    expect(def.complexity).eq(1);
    expect(def.cost).is.at.most(8);
    expect(player.megaCredits).eq(2);
  });
});
