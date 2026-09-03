import {expect} from 'chai';
import {GarbageDumps} from '../../../src/server/cards/sillyfication/GarbageDumps';
import {IGame} from '../../../src/server/IGame';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {TileType} from '../../../src/common/TileType';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('GarbageDumps', () => {
  let card: GarbageDumps;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new GarbageDumps();
    [game, player, player2] = testGame(2);
  });

  it('scores -1 VP', () => {
    expect(card.getVictoryPoints(player)).to.eq(-1);
  });

  it('places a garbage dump tile and a chosen player loses 1 TR', () => {
    const tr2 = player2.terraformRating;

    card.play(player);
    runAllActions(game);

    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    runAllActions(game);
    expect(space.tile?.tileType).to.eq(TileType.GARBAGE_DUMP);

    const selectPlayer = cast(player.popWaitingFor(), SelectPlayer);
    selectPlayer.cb(player2);
    expect(player2.terraformRating).to.eq(tr2 - 1);
  });
});
