import {expect} from 'chai';
import {CropTheft} from '../../../src/server/cards/sillyfication/CropTheft';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('CropTheft', () => {
  let card: CropTheft;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new CropTheft();
    [/* game */, player, player2] = testGame(2);
  });

  it('cannot play when no opponent can be stolen from', () => {
    player2.plants = 6; // but no plant tags
    expect(card.canPlay(player)).is.false;
  });

  it('steals 1 plant per plant tag the target has, capped at their plants', () => {
    player.plants = 1;
    player2.plants = 6;
    player2.tagsForTest = {plant: 3};

    const selectPlayer = cast(card.play(player), SelectPlayer);
    selectPlayer.cb(player2);

    // min(6 plants, 3 plant tags) = 3.
    expect(player2.plants).to.eq(3);
    expect(player.plants).to.eq(4);
  });

  it('is capped by the target\'s actual plant count', () => {
    player.plants = 0;
    player2.plants = 2;
    player2.tagsForTest = {plant: 5};

    const selectPlayer = cast(card.play(player), SelectPlayer);
    selectPlayer.cb(player2);

    expect(player2.plants).to.eq(0);
    expect(player.plants).to.eq(2);
  });
});
