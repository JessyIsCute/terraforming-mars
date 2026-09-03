import {expect} from 'chai';
import {LongDistanceRelations} from '../../../src/server/cards/sillyfication/LongDistanceRelations';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('LongDistanceRelations', () => {
  let card: LongDistanceRelations;
  let player: TestPlayer;

  beforeEach(() => {
    card = new LongDistanceRelations();
    [/* game */, player] = testGame(2);
  });

  it('gains M€ per Jovian tag, including this, and scores 1 VP', () => {
    player.megaCredits = 0;
    player.tagsForTest = {jovian: 2};

    card.play(player);

    // 2 existing + 1 from this card.
    expect(player.megaCredits).to.eq(3);
    expect(card.getVictoryPoints(player)).to.eq(1);
  });

  it('gains just its own Jovian tag with no others', () => {
    player.megaCredits = 0;
    card.play(player);
    expect(player.megaCredits).to.eq(1);
  });
});
