import {expect} from 'chai';
import {CardType} from '../../src/common/cards/CardType';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';

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
