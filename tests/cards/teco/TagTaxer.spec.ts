import {expect} from 'chai';
import {TagTaxer} from '../../../src/server/cards/teco/TagTaxer';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('TagTaxer', () => {
  let card: TagTaxer;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new TagTaxer();
    [/* game */, player, player2] = testGame(2);
  });

  it('raises every player\'s cost by their own tag count, for this generation only', () => {
    card.play(player);

    player.tagsForTest = {earth: 5};
    player2.tagsForTest = {earth: 2};
    const earthCard = {tags: [Tag.EARTH]} as any;

    expect(player.removedFromPlayCards).to.contain(card);
    expect(player2.removedFromPlayCards).to.contain(card);
    expect(card.getCardDiscount(player, earthCard)).to.eq(-5);
    expect(card.getCardDiscount(player2, earthCard)).to.eq(-2);
  });

  it('does not apply once the generation changes', () => {
    card.play(player);
    player.tagsForTest = {earth: 5};
    const earthCard = {tags: [Tag.EARTH]} as any;
    player.game.generation += 1;
    expect(card.getCardDiscount(player, earthCard)).to.eq(0);
  });
});
