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
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {cast} from '../../../src/common/utils/utils';

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

  it('a card reducing heat production offers a choice of how to split the loss with energy', () => {
    player.playedCards.push(card);
    player.production.override({heat: 3, energy: 2});

    player.production.add(Resource.HEAT, -2, {log: true});
    runAllActions(game);

    const input = cast(player.popWaitingFor(), SelectAmount);
    expect(input.min).eq(0);
    expect(input.max).eq(2);

    input.cb(1); // 1 from heat, 1 from energy

    expect(player.production.heat).eq(2);
    expect(player.production.energy).eq(1);
  });

  it('does not offer a choice when the other side has no room', () => {
    player.playedCards.push(card);
    player.production.override({heat: 3, energy: 0});

    player.production.add(Resource.HEAT, -2, {log: true});
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
    expect(player.production.heat).eq(1);
    expect(player.production.energy).eq(0);
  });

  it('the combined pool is the real floor - a big reduction can dip into both', () => {
    player.playedCards.push(card);
    player.production.override({heat: 1, energy: 1});

    // Asking for 5 heat production, but only 2 exist combined - 1 from each is the only
    // possible split, so no choice is offered.
    player.production.add(Resource.HEAT, -5, {log: true});
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
    expect(player.production.heat).eq(0);
    expect(player.production.energy).eq(0);
  });

  it('the combined pool is the real floor, with a real choice when there is room on both sides', () => {
    player.playedCards.push(card);
    player.production.override({heat: 3, energy: 3});

    // Asking for 5 heat production, but only 6 exist combined - capped at 5 total lost,
    // and anywhere from 2 to 3 of it can come from heat.
    player.production.add(Resource.HEAT, -5, {log: true});
    runAllActions(game);

    const input = cast(player.popWaitingFor(), SelectAmount);
    expect(input.min).eq(2);
    expect(input.max).eq(3);
    input.cb(2);

    expect(player.production.heat).eq(1);
    expect(player.production.energy).eq(0);
  });

  it('without Sistemas Seebeck, a heat production reduction is not redirected', () => {
    player.production.override({heat: 3, energy: 2});

    player.production.add(Resource.HEAT, -2, {log: true});
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
    expect(player.production.heat).eq(1);
    expect(player.production.energy).eq(2);
  });
});
