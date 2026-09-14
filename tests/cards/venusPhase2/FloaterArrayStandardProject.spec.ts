import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame, runAllActions} from '../../TestingUtils';
import {VenusPhase2Expansion} from '../../../src/server/venusPhase2/VenusPhase2Expansion';
import {TileType} from '../../../src/common/TileType';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '@/common/utils/utils';

describe('FloaterArrayStandardProject', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {venusPhase2Expansion: true});
  });

  it('places a tile and grants no production, unlike Cloud City/Gas Mine', () => {
    // Affording all 3 keeps them all present in their fixed order (Cloud City, Gas Mine,
    // Floater Array), so the positional destructure below reliably grabs Floater Array.
    player.megaCredits = 999;
    const [, , floaterArrayOption] = player.getVenusPhase2StandardProjectOptions();
    const amount = cast(floaterArrayOption, SelectAmount);
    amount.cb(0);
    runAllActions(game);

    const spaceSelect = cast(player.popWaitingFor(), SelectSpace);
    const target = spaceSelect.spaces[0];
    spaceSelect.cb(target);
    runAllActions(game);

    expect(player.megaCredits).to.eq(999 - 19);
    expect(player.production.megacredits).to.eq(0);
    expect(player.production.heat).to.eq(0);
    const venusSurface = VenusPhase2Expansion.venusPhase2Data(game).venusSurface;
    expect(venusSurface.getSpaceOrThrow(target.id).tile?.tileType).to.eq(TileType.VENUS_FLOATER_ARRAY);
  });
});
