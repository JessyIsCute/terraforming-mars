import {expect} from 'chai';
import {MutationMarkets} from '../../src/server/mutationmarkets/MutationMarkets';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';
import {Tag} from '../../src/common/cards/Tag';

describe('MutationMarkets.playerProgressFor', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2);
  });

  it('reports each player\'s current count for a count-based requirement', () => {
    player.expensiveCardsPlayed = 2;
    player2.expensiveCardsPlayed = 0;

    const progress = MutationMarkets.playerProgressFor(game, {expensiveCardsPlayed: 2});

    expect(progress).to.deep.eq([
      {color: player.color, score: 2},
      {color: player2.color, score: 0},
    ]);
  });

  it('reports tag-count progress', () => {
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));

    const progress = MutationMarkets.playerProgressFor(game, {tag: Tag.SCIENCE, count: 3});

    expect(progress).to.deep.eq([
      {color: player.color, score: 2},
      {color: player2.color, score: 0},
    ]);
  });

  it('reports the new cardCostStreak progress', () => {
    player.cardCostStreak = 2;

    const progress = MutationMarkets.playerProgressFor(game, {cardCostStreak: 3});

    expect(progress).to.deep.eq([
      {color: player.color, score: 2},
      {color: player2.color, score: 0},
    ]);
  });

  it('returns undefined for a requirement kind with no natural running count', () => {
    expect(MutationMarkets.playerProgressFor(game, {plantsRemoved: true})).is.undefined;
  });
});
