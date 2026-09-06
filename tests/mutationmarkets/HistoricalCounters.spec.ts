import {expect} from 'chai';
import {CardType} from '../../src/common/cards/CardType';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard, finishGeneration} from '../TestingUtils';

describe('Player expensive/cheap card counters', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [/* game */, player] = testGame(2);
  });

  it('counts cards costing 25 or more, including events', () => {
    expect(player.expensiveCardsPlayed).to.eq(0);
    player.playCard(fakeCard({cost: 25}));
    expect(player.expensiveCardsPlayed).to.eq(1);
    player.playCard(fakeCard({cost: 24}));
    expect(player.expensiveCardsPlayed).to.eq(1);
    player.playCard(fakeCard({cost: 30, type: CardType.EVENT}));
    expect(player.expensiveCardsPlayed).to.eq(2);
  });

  it('counts cards costing less than 7, including events', () => {
    expect(player.cheapCardsPlayed).to.eq(0);
    player.playCard(fakeCard({cost: 6}));
    expect(player.cheapCardsPlayed).to.eq(1);
    player.playCard(fakeCard({cost: 7}));
    expect(player.cheapCardsPlayed).to.eq(1);
    player.playCard(fakeCard({cost: 3, type: CardType.EVENT}));
    expect(player.cheapCardsPlayed).to.eq(2);
  });
});

describe('Player card cost streak (Nested Mutation requirement)', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2);
  });

  it('increments while each played card is cheaper than the last', () => {
    expect(player.cardCostStreak).to.eq(0);
    player.playCard(fakeCard({cost: 10}));
    expect(player.cardCostStreak).to.eq(1);
    player.playCard(fakeCard({cost: 7}));
    expect(player.cardCostStreak).to.eq(2);
    player.playCard(fakeCard({cost: 3}));
    expect(player.cardCostStreak).to.eq(3);
  });

  it('resets to 1 when a card is not strictly cheaper than the last', () => {
    player.playCard(fakeCard({cost: 5}));
    player.playCard(fakeCard({cost: 3}));
    expect(player.cardCostStreak).to.eq(2);
    player.playCard(fakeCard({cost: 3})); // equal, not cheaper
    expect(player.cardCostStreak).to.eq(1);
    player.playCard(fakeCard({cost: 10})); // more expensive
    expect(player.cardCostStreak).to.eq(1);
  });

  it('resets at the start of a new generation', () => {
    player.playCard(fakeCard({cost: 10}));
    player.playCard(fakeCard({cost: 5}));
    expect(player.cardCostStreak).to.eq(2);

    finishGeneration(game);

    expect(player.cardCostStreak).to.eq(0);
  });
});
