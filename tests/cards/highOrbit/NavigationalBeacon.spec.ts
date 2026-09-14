import {expect} from 'chai';
import {NavigationalBeacon} from '../../../src/server/cards/highOrbit/NavigationalBeacon';
import {Tag} from '../../../src/common/cards/Tag';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';

describe('NavigationalBeacon', () => {
  let card: NavigationalBeacon;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new NavigationalBeacon();
    [game, player] = testGame(2);
  });

  it('discounts cards with a Space tag by 1 M€', () => {
    expect(card.getCardDiscount(player, fakeCard({tags: [Tag.SPACE]}))).to.eq(1);
  });

  it('does not discount cards without a Space tag', () => {
    expect(card.getCardDiscount(player, fakeCard({tags: [Tag.BUILDING]}))).to.eq(0);
  });
});
