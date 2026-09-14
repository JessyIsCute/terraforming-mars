import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame, runAllActions} from '../../TestingUtils';
import {CloudCityStandardProject} from '../../../src/server/cards/venusPhase2/CloudCityStandardProject';
import {GasMineStandardProject} from '../../../src/server/cards/venusPhase2/GasMineStandardProject';
import {VenusPhase2Expansion} from '../../../src/server/venusPhase2/VenusPhase2Expansion';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {AerialMappers} from '../../../src/server/cards/venusNext/AerialMappers';
import {TileType} from '../../../src/common/TileType';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '@/common/utils/utils';

// getVenusPhase2StandardProjectOptions() builds its options in a fixed order (Cloud City, Gas
// Mine, Floater Array), skipping any that lack space/affordability -- as long as a scenario
// doesn't drop Cloud City specifically, it's always first.
function cloudCityOption(player: TestPlayer): SelectAmount {
  return cast(player.getVenusPhase2StandardProjectOptions()[0], SelectAmount);
}

describe('CloudCityStandardProject', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {venusPhase2Expansion: true});
  });

  it('is not offered in the grouped Standard Projects list', () => {
    const names = game.getStandardProjects().map((c) => c.name);
    expect(names).to.not.include(new CloudCityStandardProject().name);
    expect(names).to.not.include(new GasMineStandardProject().name);
  });

  it('is offered as its own action once affordable', () => {
    player.megaCredits = 25;
    expect(player.getVenusPhase2StandardProjectOptions().length).to.eq(3);
  });

  it('is not offered when there is no available land space (but Gas Mine still is)', () => {
    player.megaCredits = 999;
    const venusSurface = VenusPhase2Expansion.venusPhase2Data(game).venusSurface;
    for (const space of venusSurface.getAvailableSpacesForLand(player)) {
      VenusPhase2Expansion.addFloaterArrayTile(player, space.id);
    }
    expect(player.getVenusPhase2StandardProjectOptions().length).to.eq(1);
  });

  it('is not offered when unaffordable, even with a full floater discount', () => {
    player.megaCredits = 0;
    expect(player.getVenusPhase2StandardProjectOptions().length).to.eq(0);
  });

  it('places a tile and grants +1 M€ production, paying the full 25 M€ with no floaters', () => {
    player.megaCredits = 25;
    const amount = cloudCityOption(player);
    amount.cb(0);
    runAllActions(game);

    const space = cast(player.popWaitingFor(), SelectSpace);
    const target = space.spaces[0];
    space.cb(target);
    runAllActions(game);

    expect(player.megaCredits).to.eq(0);
    expect(player.production.megacredits).to.eq(1);
    const venusSurface = VenusPhase2Expansion.venusPhase2Data(game).venusSurface;
    expect(venusSurface.getSpaceOrThrow(target.id).tile?.tileType).to.eq(TileType.VENUS_CLOUD_CITY);
  });

  it('discounts 3 M€ per floater spent, pulling from a single card with enough floaters', () => {
    const dirigibles = new Dirigibles();
    dirigibles.resourceCount = 3;
    player.playedCards.push(dirigibles);
    player.megaCredits = 25 - 9; // Full price minus a 3-floater discount.

    const amount = cloudCityOption(player);
    expect(amount.max).to.eq(3); // floor(25/3) = 8, but only 3 floaters are actually held.
    amount.cb(3);
    runAllActions(game);

    expect(dirigibles.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(0);

    // Still finishes the project -- confirm the placement prompt is now up.
    const space = cast(player.popWaitingFor(), SelectSpace);
    expect(space).to.exist;
  });

  it('prompts to pick a card when floaters are spread across more than one', () => {
    const dirigibles = new Dirigibles();
    dirigibles.resourceCount = 1;
    const mappers = new AerialMappers();
    mappers.resourceCount = 1;
    player.playedCards.push(dirigibles, mappers);
    player.megaCredits = 25;

    const amount = cloudCityOption(player);
    amount.cb(1);
    runAllActions(game);

    const pick = cast(player.popWaitingFor(), SelectCard);
    pick.cb([dirigibles]);
    runAllActions(game);

    expect(dirigibles.resourceCount).to.eq(0);
    expect(mappers.resourceCount).to.eq(1);
  });
});
