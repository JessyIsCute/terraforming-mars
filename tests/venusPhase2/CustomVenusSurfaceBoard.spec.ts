import {expect} from 'chai';
import {VenusSurfaceBoard, VENUS_STRATOPOLIS, VENUS_MAXWELL_BASE} from '../../src/server/venusPhase2/VenusSurfaceBoard';
import {SeededRandom} from '../../src/common/utils/Random';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {blankSimpleBoard} from '../../src/common/boards/SimpleCustomBoardDefinition';
import {TestPlayer} from '../TestPlayer';

describe('VenusSurfaceBoard with a custom definition', () => {
  it('builds the grid from the definition instead of the hard-coded default', () => {
    const def = blankSimpleBoard('venusPhase2', 'All Land');
    def.spaces[0].spaceType = SpaceType.GASLIGHT;

    const board = VenusSurfaceBoard.newInstance(
      {...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def}, new SeededRandom(0));

    const gridSpaces = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);
    expect(gridSpaces).to.have.length(37);
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

  it('places a map-editor-chosen reservation on that exact grid cell instead of the off-grid fallback', () => {
    const def = blankSimpleBoard('venusPhase2', 'Chosen Spots');
    def.spaces[5].reserved = 'stratopolis';
    def.spaces[10].reserved = 'maxwellBase';
    const gameOptions = {...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def, expansions: {...DEFAULT_GAME_OPTIONS.expansions, venus: true}};

    const board = VenusSurfaceBoard.newInstance(gameOptions, new SeededRandom(0));

    const stratopolis = board.getSpaceOrThrow(VENUS_STRATOPOLIS);
    expect(stratopolis.spaceType).to.eq(SpaceType.COLONY);
    expect(stratopolis.x).to.eq(def.spaces[5].x);
    expect(stratopolis.y).to.eq(def.spaces[5].y);

    const maxwellBase = board.getSpaceOrThrow(VENUS_MAXWELL_BASE);
    expect(maxwellBase.spaceType).to.eq(SpaceType.COLONY);
    expect(maxwellBase.x).to.eq(def.spaces[10].x);
    expect(maxwellBase.y).to.eq(def.spaces[10].y);

    // No separate off-grid entry for either -- the on-grid reservation already covers it.
    expect(board.spaces.filter((s) => s.x === -1 && s.y === -1)).to.have.length(0);
    expect(board.spaces).to.have.length(37);
  });

  it('excludes a chosen reservation from normal land placement', () => {
    const def = blankSimpleBoard('venusPhase2', 'Chosen Spot');
    def.spaces[5].reserved = 'stratopolis';
    const gameOptions = {...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def, expansions: {...DEFAULT_GAME_OPTIONS.expansions, venus: true}};
    const board = VenusSurfaceBoard.newInstance(gameOptions, new SeededRandom(0));

    const player = TestPlayer.BLUE.newPlayer();
    const landIds = board.getAvailableSpacesForLand(player).map((s) => s.id);
    expect(landIds).to.not.include(VENUS_STRATOPOLIS);
  });

  it('ignores a reservation for a card that is not actually in this game\'s deck', () => {
    const def = blankSimpleBoard('venusPhase2', 'Ignored Reservation');
    def.spaces[5].reserved = 'stratopolis';
    // Neither the Venus expansion nor Stratopolis specifically is included here.
    const board = VenusSurfaceBoard.newInstance({...DEFAULT_GAME_OPTIONS, customVenusSurfaceBoard: def}, new SeededRandom(0));

    expect(() => board.getSpaceOrThrow(VENUS_STRATOPOLIS)).to.throw();
    // The cell just reverts to a normal grid space instead of vanishing.
    expect(board.spaces).to.have.length(37);
  });
});
