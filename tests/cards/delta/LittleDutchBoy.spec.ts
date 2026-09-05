import {expect} from 'chai';
import {LittleDutchBoy} from '../../../src/server/cards/delta/LittleDutchBoy';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {cast} from '../../../src/common/utils/utils';
import {DeltaProjectExpansion} from '../../../src/server/delta/DeltaProjectExpansion';

describe('LittleDutchBoy', () => {
  let card: LittleDutchBoy;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new LittleDutchBoy();
    [/* game */, player, player2] = testGame(2, {deltaProjectExpansion: true});
  });

  it('gains 1 steel when it has no steel to spend or no valid target', () => {
    player.steel = 0;
    expect(card.action(player)).is.undefined;
    expect(player.steel).eq(1);
  });

  it('offers a choice once steel and a target are available', () => {
    player.steel = 1;
    const orOptions = cast(card.action(player), OrOptions);
    expect(orOptions.options).has.length(2);
  });

  it('blocks an opponent\'s Delta Project marker for the rest of the generation', () => {
    player.steel = 1;
    const orOptions = cast(card.action(player), OrOptions);
    const block = orOptions.options.find((o) => o.title.toString().includes('Spend 1 steel'))!;
    const selectPlayer = cast(block.cb(undefined), SelectPlayer);
    selectPlayer.cb(player2);

    expect(player.steel).eq(0);
    expect(player2.deltaProjectData!.blocked).is.true;
    expect(DeltaProjectExpansion.getValidAdvanceSteps(player2)).deep.eq([]);
  });
});
