import {expect} from 'chai';
import {SistemasSeebeck} from '../../../src/server/cards/pathfinders/SistemasSeebeck';
import {Tag} from '../../../src/common/cards/Tag';
import {Resource} from '../../../src/common/Resource';
import {testGame} from '../../TestGame';
import {runAllActions, fakeCard} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {ProductionRequirement} from '../../../src/server/cards/requirements/ProductionRequirement';
import {TradeWithEnergy} from '../../../src/server/player/Colonies';
import {Pluto} from '../../../src/server/colonies/Pluto';

describe('SistemasSeebeck', () => {
  let card: SistemasSeebeck;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new SistemasSeebeck();
    [game, player] = testGame(1);
  });

  it('has Science and Power tags', () => {
    expect(card.tags).to.deep.eq([Tag.SCIENCE, Tag.POWER]);
  });

  it('starts with 45 M€', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(player.megaCredits).eq(45);
  });

  it('initial action draws until 2 cards that spend energy or heat are found, discarding the rest', () => {
    const match1 = fakeCard({behavior: {spend: {energy: 1}}});
    // Merely granting energy/heat doesn't count - only spending it does.
    const nonMatch1 = fakeCard({behavior: {production: {energy: 1}}});
    const nonMatch2 = fakeCard({behavior: {stock: {heat: 2}}});
    const match2 = fakeCard({behavior: {spend: {heat: 1}}});
    // drawPile.pop() draws from the end, so this order draws match1, then the two
    // non-matches, then match2.
    game.projectDeck.drawPile.push(match2, nonMatch2, nonMatch1, match1);

    card.initialAction(player);
    runAllActions(game);

    expect(player.cardsInHand).includes(match1);
    expect(player.cardsInHand).includes(match2);
    expect(player.cardsInHand).not.includes(nonMatch1);
    expect(player.cardsInHand).not.includes(nonMatch2);
  });

  it('spend.energy can be paid with heat', () => {
    player.playedCards.push(card);
    player.energy = 1;
    player.heat = 2;
    player.spendEnergy(3);
    expect(player.energy).eq(0);
    expect(player.heat).eq(0);
  });

  it('spend.heat can be paid with energy', () => {
    player.playedCards.push(card);
    player.heat = 1;
    player.energy = 2;
    player.spendHeat(3);
    expect(player.heat).eq(0);
    expect(player.energy).eq(0);
  });

  it('availableEnergy and availableHeat are combined, but only with the card in play', () => {
    player.energy = 2;
    player.heat = 3;
    expect(player.availableEnergy()).eq(2);
    expect(player.availableHeat()).eq(3);

    player.playedCards.push(card);
    expect(player.availableEnergy()).eq(5);
    expect(player.availableHeat()).eq(5);
  });

  it('production requirements treat energy and heat production as one combined pool', () => {
    const requirement = new ProductionRequirement(Resource.ENERGY, {count: 3});
    player.production.override({energy: 1, heat: 1});
    expect(requirement.satisfies(player, card)).is.false;

    player.playedCards.push(card);
    expect(requirement.satisfies(player, card)).is.false;

    player.production.override({energy: 1, heat: 2});
    expect(requirement.satisfies(player, card)).is.true;
  });

  it('colony trading with energy can be paid for with heat', () => {
    player.playedCards.push(card);
    player.energy = 1;
    player.heat = 2;

    const trader = new TradeWithEnergy(player);
    expect(trader.canUse()).is.true;

    trader.trade(new Pluto());

    expect(player.energy).eq(0);
    expect(player.heat).eq(0);
  });

  it('without Sistemas Seebeck, colony trading with energy cannot be covered by heat', () => {
    player.energy = 1;
    player.heat = 2;

    const trader = new TradeWithEnergy(player);
    expect(trader.canUse()).is.false;
  });
});
