import {expect} from 'chai';
import {PureEnergy} from '../../../src/server/cards/teco/PureEnergy';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('PureEnergy', () => {
  let card: PureEnergy;
  let player: TestPlayer;

  beforeEach(() => {
    card = new PureEnergy();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('gains 7 energy production on play', () => {
    player.production.override({energy: 0});
    card.play(player);
    expect(player.production.energy).to.eq(7);
  });

  it('discounts Power-tagged cards by your energy resource + Power tag count + energy production', () => {
    player.tagsForTest = {power: 3};
    player.energy = 4;
    player.production.override({energy: 2});
    const powerCard = {tags: [Tag.POWER]} as any;
    const otherCard = {tags: [Tag.EARTH]} as any;

    expect(card.getCardDiscount(player, powerCard)).to.eq(9); // 4 + 3 + 2
    expect(card.getCardDiscount(player, otherCard)).to.eq(0);
  });
});
