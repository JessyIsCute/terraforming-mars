import {expect} from 'chai';
import {Venuphile} from '../../../src/server/cards/teco/Venuphile';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Venuphile', () => {
  let card: Venuphile;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Venuphile();
    [/* game */, player] = testGame(2, {venusNextExtension: true});
    player.playedCards.push(card);
  });

  it('discounts Venus cards by your Venus tag count', () => {
    player.tagsForTest = {venus: 3};
    const venusCard = {tags: [Tag.VENUS]} as any;
    const otherCard = {tags: [Tag.EARTH]} as any;

    expect(card.getCardDiscount(player, venusCard)).to.eq(3);
    expect(card.getCardDiscount(player, otherCard)).to.eq(0);
  });
});
