import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame, runAllActions} from '../../TestingUtils';
import {VenusPhase2Expansion} from '../../../src/server/venusPhase2/VenusPhase2Expansion';
import {TileType} from '../../../src/common/TileType';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {cast} from '@/common/utils/utils';

describe('GasMineStandardProject', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {venusPhase2Expansion: true});
  });

  it('is not offered once every gaslight space is taken (Cloud City/Floater Array still are)', () => {
    player.megaCredits = 999;
    const venusSurface = VenusPhase2Expansion.venusPhase2Data(game).venusSurface;
    for (const space of venusSurface.getAvailableSpacesForGaslight(player)) {
      VenusPhase2Expansion.addGasMineTile(player, space.id);
    }
    expect(player.getVenusPhase2StandardProjectOptions().length).to.eq(2);
  });

  it('places a Gas Mine on a gaslight space (never a plain land space) and grants +1 heat production', () => {
    // Affording all 3 keeps them all present in their fixed order (Cloud City, Gas Mine,
    // Floater Array), so the positional destructure below reliably grabs Gas Mine.
    player.megaCredits = 999;
    const [, gasMineOption] = player.getVenusPhase2StandardProjectOptions();
    const amount = cast(gasMineOption, SelectAmount);
    amount.cb(0);
    runAllActions(game);

    const spaceSelect = cast(player.popWaitingFor(), SelectSpace);
    expect(spaceSelect.spaces.every((s) => s.spaceType === SpaceType.GASLIGHT)).is.true;
    const target = spaceSelect.spaces[0];
    spaceSelect.cb(target);
    runAllActions(game);

    expect(player.megaCredits).to.eq(999 - 21);
    expect(player.production.heat).to.eq(1);
    const venusSurface = VenusPhase2Expansion.venusPhase2Data(game).venusSurface;
    expect(venusSurface.getSpaceOrThrow(target.id).tile?.tileType).to.eq(TileType.VENUS_GAS_MINE);
  });
});
