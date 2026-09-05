import {expect} from 'chai';
import {Jupiter} from '../../../src/server/cards/teco/Jupiter';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Jupiter', () => {
  let card: Jupiter;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Jupiter();
    [/* game */, player] = testGame(2);
  });

  it('has three Jovian tags and 10 VP', () => {
    expect(card.tags).to.deep.eq([Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN]);
    expect(card.getVictoryPoints(player)).to.eq(10);
  });

  it('requires 3 Jovian tags', () => {
    player.tagsForTest = {jovian: 2};
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {jovian: 3};
    expect(card.canPlay(player)).is.true;
  });
});
