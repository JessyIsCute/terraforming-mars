import {expect} from 'chai';
import {SpaceOffice} from '../../../src/server/cards/teco/SpaceOffice';
import {Comet} from '../../../src/server/cards/base/Comet';
import {Sponsors} from '../../../src/server/cards/base/Sponsors';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('SpaceOffice', () => {
  let card: SpaceOffice;
  let player: TestPlayer;

  beforeEach(() => {
    card = new SpaceOffice();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.cardsInHand = [];
  });

  it('draws a card when a space tag is played', () => {
    card.onCardPlayed(player, new Comet());
    expect(player.cardsInHand).has.lengthOf(1);
  });

  it('does not draw for a card without a space tag', () => {
    card.onCardPlayed(player, new Sponsors());
    expect(player.cardsInHand).has.lengthOf(0);
  });
});
