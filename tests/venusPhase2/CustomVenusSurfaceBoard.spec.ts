import {expect} from 'chai';
import {VenusSurfaceBoard, VENUS_STRATOPOLIS, VENUS_MAXWELL_BASE} from '../../src/server/venusPhase2/VenusSurfaceBoard';
import {SeededRandom} from '../../src/common/utils/Random';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {blankSimpleBoard} from '../../src/common/boards/SimpleCustomBoardDefinition';

describe('VenusSurfaceBoard with a custom definition', () => {
  it('builds the grid from the definition instead of the hard-coded default', () => {
    const def = blankSimpleBoard('venusPhase2', 'All Land');
    def.spaces[0].spaceType = SpaceType.GASLIGHT;

    const board = VenusSurfaceBoard.newInstance(
      {...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def}, new SeededRandom(0));

    const gridSpaces = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);
    expect(gridSpaces).to.have.length(30);
    expect(gridSpaces[0].spaceType).to.eq(SpaceType.GASLIGHT);
    expect(gridSpaces.every((s, i) => i === 0 || s.spaceType === SpaceType.LAND)).is.true;
  });

  it('still appends the reserved off-grid Stratopolis/Maxwell Base spaces, expansion-gated as usual', () => {
    const def = blankSimpleBoard('venusPhase2', 'All Land');
    const board = VenusSurfaceBoard.newInstance(
      {...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def, expansions: {...DEFAULT_GAME_OPTIONS.expansions, venus: true}},
      new SeededRandom(0));

    expect(board.getSpaceOrThrow(VENUS_STRATOPOLIS).spaceType).to.eq(SpaceType.COLONY);
    expect(board.getSpaceOrThrow(VENUS_MAXWELL_BASE).spaceType).to.eq(SpaceType.COLONY);
  });

  it('assigns the same grid ids as the default path, regardless of definition content', () => {
    const def = blankSimpleBoard('venusPhase2', 'All Land');
    const custom = VenusSurfaceBoard.newInstance({...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def}, new SeededRandom(0));
    const stock = VenusSurfaceBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
    expect(custom.spaces.map((s) => s.id)).to.deep.eq(stock.spaces.map((s) => s.id));
  });
});
