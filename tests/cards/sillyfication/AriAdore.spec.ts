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

  it('scores 2 VP', () => {
    expect(card.getVictoryPoints(player)).to.eq(2);
  });

  it('gains 1 M€ per tag you have for each new tag type', () => {
    player.tagsForTest = {animal: 2, plant: 1};

    // Fish: animal tag -> new type. 3 tags total.
    card.onCardPlayed(player, new Fish());
    expect(player.megaCredits).to.eq(3);

    // Another animal tag -> not new.
    card.onCardPlayed(player, new Fish());
    expect(player.megaCredits).to.eq(3);

    // LunarBeam: energy + earth -> two new types, still 3 tags each time.
    card.onCardPlayed(player, new LunarBeam());
    expect(player.megaCredits).to.eq(9);
  });

  it('ignores event cards', () => {
    player.tagsForTest = {earth: 3};
    card.onCardPlayed(player, new ImportedHydrogen()); // event with earth/space tags
    expect(player.megaCredits).to.eq(0);
  });
});
