import {expect} from 'chai';
import {AriAdore} from '../../../src/server/cards/sillyfication/AriAdore';
import {Fish} from '../../../src/server/cards/base/Fish';
import {ImportedHydrogen} from '../../../src/server/cards/base/ImportedHydrogen';
import {LunarBeam} from '../../../src/server/cards/base/LunarBeam';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('AriAdore', () => {
  let card: AriAdore;
  let player: TestPlayer;

  beforeEach(() => {
    card = new AriAdore();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.megaCredits = 0;
  });

  it('scores 1 VP', () => {
    expect(card.getVictoryPoints(player)).to.eq(1);
  });

  it('gains 4 M€ for each new tag type', () => {
    // Fish: animal tag -> new.
    card.onCardPlayed(player, new Fish());
    expect(player.megaCredits).to.eq(4);

    // Another animal tag -> not new.
    card.onCardPlayed(player, new Fish());
    expect(player.megaCredits).to.eq(4);

    // LunarBeam: energy + earth tags -> two new types.
    card.onCardPlayed(player, new LunarBeam());
    expect(player.megaCredits).to.eq(12);
  });

  it('ignores event cards', () => {
    card.onCardPlayed(player, new ImportedHydrogen()); // event with earth/space tags
    expect(player.megaCredits).to.eq(0);
  });
});
