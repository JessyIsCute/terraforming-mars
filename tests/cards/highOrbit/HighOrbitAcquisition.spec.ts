import {expect} from 'chai';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SpaceTradingStation} from '../../../src/server/cards/highOrbit/SpaceTradingStation';

// High Orbit (fan): Infrastructure cards are never dealt or drawn -- they live in a shared
// supply (IGame.infrastructureSupply) and are acquired via Player.getHighOrbitInfrastructureOptions
// as a normal action, paid in Titanium (substitutable at 4 M€ per Titanium not spent). Planetary
// Outpost is the one exception: standard M€ rules, no Infrastructure tag.
describe('High Orbit Infrastructure acquisition', () => {
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    [game, player] = testGame(2, {highOrbitExpansion: true});
    player.tagsForTest = {[Tag.SPACE]: 1};
  });

  it('offers nothing when the expansion is off', () => {
    [game, player] = testGame(2);
    expect(player.getHighOrbitInfrastructureOptions()).has.lengthOf(0);
  });

  it('offers nothing when the supply is exhausted', () => {
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 0]]);
    expect(player.getHighOrbitInfrastructureOptions()).has.lengthOf(0);
  });

  it('offers nothing for a design whose requirement is unmet', () => {
    player.tagsForTest = {};
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 3]]);
    expect(player.getHighOrbitInfrastructureOptions()).has.lengthOf(0);
  });

  it('offers nothing for a design the player already owns', () => {
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 3]]);
    player.tagsForTest = {[Tag.SPACE]: 1, [Tag.INFRASTRUCTURE]: 1};
    player.playedCards.push(new SpaceTradingStation());
    expect(player.getHighOrbitInfrastructureOptions()).has.lengthOf(0);
  });

  it('acquires a design paying all Titanium', () => {
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 3]]);
    player.titanium = 3;
    player.megaCredits = 20;

    const options = player.getHighOrbitInfrastructureOptions();
    expect(options).has.lengthOf(1);
    const selectAmount = cast(options[0], SelectAmount);
    expect(selectAmount.min).to.eq(0);
    expect(selectAmount.max).to.eq(3);

    selectAmount.cb(3);
    runAllActions(game);

    expect(player.titanium).to.eq(0);
    expect(player.megaCredits).to.eq(20);
    expect(player.tableau.has(CardName.SPACE_TRADING_STATION)).is.true;
    expect(game.infrastructureSupply.get(CardName.SPACE_TRADING_STATION)).to.eq(2);
  });

  it('acquires a design paying a Titanium/M€ split at 4 M€ per Titanium not spent', () => {
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 3]]);
    player.titanium = 1;
    player.megaCredits = 8;

    const options = player.getHighOrbitInfrastructureOptions();
    const selectAmount = cast(options[0], SelectAmount);
    // cost 3: at least 1 titanium is required since only 8 M€ (2 titanium-equivalents) is on hand.
    expect(selectAmount.min).to.eq(1);
    expect(selectAmount.max).to.eq(1);

    selectAmount.cb(1);
    runAllActions(game);

    expect(player.titanium).to.eq(0);
    expect(player.megaCredits).to.eq(0);
    expect(player.tableau.has(CardName.SPACE_TRADING_STATION)).is.true;
  });

  it('excludes an unaffordable design entirely', () => {
    game.infrastructureSupply = new Map([[CardName.SPACE_TRADING_STATION, 3]]);
    player.titanium = 0;
    player.megaCredits = 0;

    expect(player.getHighOrbitInfrastructureOptions()).has.lengthOf(0);
  });

  it('Planetary Outpost carries the Building tag and is offered via standard M€ payment, not Titanium', () => {
    game.infrastructureSupply = new Map([[CardName.PLANETARY_OUTPOST, 5]]);
    player.megaCredits = 4;
    player.titanium = 0;

    const options = player.getHighOrbitInfrastructureOptions();
    expect(options).has.lengthOf(1);
    const selectOption = cast(options[0], SelectOption);

    selectOption.cb(undefined);
    runAllActions(game);

    expect(player.megaCredits).to.eq(0);
    expect(player.tableau.has(CardName.PLANETARY_OUTPOST)).is.true;
    expect(game.infrastructureSupply.get(CardName.PLANETARY_OUTPOST)).to.eq(4);
  });
});
