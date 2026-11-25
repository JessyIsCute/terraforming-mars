import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {AssemblyLine} from '../../../src/server/cards/assembler/AssemblyLine';
import {PrototypeWorkshop} from '../../../src/server/cards/assembler/PrototypeWorkshop';
import {SalvageYard} from '../../../src/server/cards/assembler/SalvageYard';
import {ModularFactory} from '../../../src/server/cards/assembler/ModularFactory';
import {getAssembledCardDefinition, isAssembledCardName} from '../../../src/server/assembler/AssembledCardRegistry';
import {AssemblerExpansion} from '../../../src/server/assembler/AssemblerExpansion';
import {Mine} from '../../../src/server/cards/base/Mine';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('Assembler printed cards', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {assemblerExpansion: true});
  });

  it('Assembly Line: spend 1 M€ to assemble a card into your hand', () => {
    const card = new AssemblyLine();
    player.megaCredits = 0;
    expect(card.canAct(player)).is.false;

    player.megaCredits = 1;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);

    expect(player.megaCredits).eq(0);
    expect(player.cardsInHand).has.length(1);
    expect(isAssembledCardName(player.cardsInHand[0].name)).is.true;
  });

  it('Prototype Workshop: two assembled cards into your hand and 1 steel', () => {
    const deckSize = game.projectDeck.drawPile.length;
    player.playCard(new PrototypeWorkshop());
    runAllActions(game);

    expect(player.cardsInHand).has.length(2);
    expect(player.cardsInHand.every((c) => isAssembledCardName(c.name))).is.true;
    expect(player.steel).eq(1);
    // into the hand, not the deck
    expect(game.projectDeck.drawPile).has.length(deckSize);
  });

  it('Salvage Yard: seeds the deck, then pays 2 M€ for each assembled card you play', () => {
    const card = new SalvageYard();
    const deckSize = game.projectDeck.drawPile.length;
    player.playCard(card);
    runAllActions(game);
    expect(game.projectDeck.drawPile).has.length(deckSize + 3);

    player.megaCredits = 0;
    player.playCard(new Mine());
    expect(player.megaCredits).eq(0);

    const [assembled] = AssemblerExpansion.assembleIntoHand(player, 1);
    player.playCard(assembled);
    runAllActions(game);
    // The assembled card may give M€ itself; Salvage Yard adds 2 on top.
    const ownGain = getAssembledCardDefinition(assembled.name)?.behavior?.stock?.megacredits ?? 0;
    expect(player.megaCredits).eq(2 + (typeof ownGain === 'number' ? ownGain : 0));
  });

  it('Modular Factory: steel production, an assembled card, 1 VP', () => {
    const card = new ModularFactory();
    player.playCard(card);
    runAllActions(game);

    expect(player.production.steel).eq(1);
    expect(player.cardsInHand).has.length(1);
    expect(isAssembledCardName(player.cardsInHand[0].name)).is.true;
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('with the expansion on, setup shuffles assembled cards into the deck', () => {
    expect(game.assembledCards).has.length(AssemblerExpansion.SETUP_CARDS);
    const inDeck = game.projectDeck.drawPile.filter((c) => isAssembledCardName(c.name));
    const dealt = game.players.flatMap((p) => [...p.cardsInHand, ...p.dealtProjectCards]).filter((c) => isAssembledCardName(c.name));
    expect(inDeck.length + dealt.length).eq(AssemblerExpansion.SETUP_CARDS);
  });

  it('without the expansion, setup assembles nothing', () => {
    const [plainGame] = testGame(2);
    expect(plainGame.assembledCards).is.empty;
  });

  it('the printed cards are in the deck only with the expansion on', () => {
    const names = game.projectDeck.drawPile.map((c) => c.name);
    const [plainGame] = testGame(2);
    const plainNames = plainGame.projectDeck.drawPile.map((c) => c.name);
    const printed = [new AssemblyLine(), new PrototypeWorkshop(), new SalvageYard(), new ModularFactory()].map((c) => c.name);
    // Some may have been dealt; at least none appear without the expansion.
    expect(printed.some((n) => names.includes(n) || game.players.some((p) => p.dealtProjectCards.some((c) => c.name === n)))).is.true;
    expect(printed.some((n) => plainNames.includes(n))).is.false;
  });
});
