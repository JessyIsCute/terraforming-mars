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

  it('an adjacent tile owner loses 1 TR', () => {
    const p2Space = game.board.getAvailableSpacesOnLand(player2)[0];
    game.addGreenery(player2, p2Space);
    const tr2 = player2.terraformRating;

    card.play(player);
    runAllActions(game);

    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const adjacent = game.board.getAdjacentSpaces(p2Space).find((s) => selectSpace.spaces.includes(s));
    if (adjacent === undefined) {
      throw new Error('no adjacent placement space for test setup');
    }
    selectSpace.cb(adjacent);
    runAllActions(game);
    expect(adjacent.tile?.tileType).to.eq(TileType.GARBAGE_DUMP);

    const selectPlayer = cast(player.popWaitingFor(), SelectPlayer);
    expect(selectPlayer.players).to.deep.eq([player2]);
    selectPlayer.cb(player2);
    expect(player2.terraformRating).to.eq(tr2 - 1);
  });

  it('no TR loss when no other player has an adjacent tile', () => {
    const tr2 = player2.terraformRating;

    card.play(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
    expect(player2.terraformRating).to.eq(tr2);
  });
});
