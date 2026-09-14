import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {SpaceType} from '../../common/boards/SpaceType';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceId, isSpaceId, safeCast} from '../../common/Types';
import {GameOptions} from '../../server/game/GameOptions';
import {Random} from '../../common/utils/Random';
import {CardName} from '../../common/cards/CardName';
import {VENUS_SURFACE_ROWS} from '../../common/boards/SimpleCustomBoardDefinition';
import {hexRowLayout} from '../../common/boards/CustomBoardDefinition';

// Deliberately NOT SpaceName.STRATOPOLIS/MAXWELL_BASE ('72'/'73') -- those are the Mars board's
// own space ids, and this is a genuinely separate Board instance with its own numeric range
// (200+). Reusing them would collide once client-side rendering keys off space id (DOM
// data_space_id, log-highlight lookup), even though server-side lookups stay board-scoped and
// wouldn't have noticed. Fixed, out-of-band ids -- well clear of the grid's own 200+ range below.
export const VENUS_STRATOPOLIS: SpaceId = safeCast('298', isSpaceId);
export const VENUS_MAXWELL_BASE: SpaceId = safeCast('299', isSpaceId);

function colonySpace(id: SpaceId): Space {
  return {id, spaceType: SpaceType.COLONY, x: -1, y: -1, bonus: []};
}

export class VenusSurfaceBoard extends Board {
  // Any open, non-reserved surface space -- Cloud City and Floater Array can go here.
  public getAvailableSpacesForLand(player: IPlayer): ReadonlyArray<Space> {
    return this.spaces.filter((space) =>
      space.tile === undefined &&
      space.spaceType === SpaceType.LAND &&
      (space.player === undefined || space.player.id === player.id));
  }

  // Gas Mine is restricted to the yellow-highlighted "gaslight" spaces.
  public getAvailableSpacesForGaslight(player: IPlayer): ReadonlyArray<Space> {
    return this.spaces.filter((space) =>
      space.tile === undefined &&
      space.spaceType === SpaceType.GASLIGHT &&
      (space.player === undefined || space.player.id === player.id));
  }

  public static newInstance(gameOptions: GameOptions, _rng: Random): VenusSurfaceBoard {
    const b = new Builder();
    const custom = gameOptions.customVenusSurfaceBoard;

    if (custom !== undefined) {
      // A user-authored layout from the map editor (see SimpleCustomBoardDefinition.ts). Its
      // `spaces` are already in the same row-major order as the grid loop in Builder.build()
      // below (both derive from the same simpleBoardLayout('venusPhase2') shape), so this just
      // supplies the type/bonus arrays that loop reads.
      for (const space of custom.spaces) {
        b.spaceTypes.push(space.spaceType);
        b.bonuses.push(space.bonus);
      }
    } else {
      // A true regular hexagon (side length 4 -- see VENUS_SURFACE_ROWS): mostly open land for
      // Cloud City/Floater Array, with a handful of gaslight spaces reserved for Gas Mine
      // scattered through it.
      b.row(3).land().land().gaslight().land();
      b.row(2).land().gaslight().land().land().land();
      b.row(1).land().land().gaslight().land().land().land();
      b.row(0).land().land().land().gaslight().land().land().land();
      b.row(1).land().land().gaslight().land().land().land();
      b.row(2).land().gaslight().land().land().land();
      b.row(3).land().land().gaslight().land();
    }

    const spaces = b.build(gameOptions);
    return new VenusSurfaceBoard(spaces);
  }
}

class Builder {
  y: number = -1;
  x: number = 0;
  spaceTypes: Array<SpaceType> = [];
  bonuses: Array<Array<SpaceBonus>> = [];
  spaces: Array<Space> = [];

  public row(startX: number): Row {
    this.y++;
    this.x = startX;
    return new Row(this);
  }
  public build(gameOptions: GameOptions): Array<Space> {
    // Stratopolis/MaxwellBase's reserved off-grid spots, relocated here from the Mars board --
    // same "is this card's expansion actually in play" gate BoardBuilder.addExpansionColonySpaces
    // already applies on Mars, so this board doesn't reserve a spot for a card that isn't even
    // in the deck. See expansionSpaceColonies.ts / BoardBuilder.ts for the venusPhase2Expansion
    // check that keeps them on Mars instead when this expansion is off. Fixed ids (not counted
    // toward idOffset below), so the grid's own ids stay stable regardless of which of these are
    // actually reserved in a given game.
    if (gameOptions.expansions.venus || gameOptions.includedCards.includes(CardName.STRATOPOLIS)) {
      this.spaces.push(colonySpace(VENUS_STRATOPOLIS));
    }
    if (gameOptions.expansions.venus || gameOptions.includedCards.includes(CardName.MAXWELL_BASE)) {
      this.spaces.push(colonySpace(VENUS_MAXWELL_BASE));
    }

    // A true regular hexagon, built with hexRowLayout -- the exact same proven formula Mars's own
    // boards use (see VENUS_SURFACE_ROWS's own comment). customSpacePixel (the generic pixel-layout
    // formula both this board's client component and the map editor's preview use) requires
    // exactly this kind of shape; an earlier hand-rolled attempt looked plausible but wasn't
    // actually regular (mismatched edge lengths) and rendered with visible gaps and a stray hex.
    const idOffset = 1;
    let idx = 0;

    for (const row of hexRowLayout(VENUS_SURFACE_ROWS)) {
      for (let i = 0; i < row.width; i++) {
        const spaceId = idx + idOffset;
        const xCoordinate = row.xOffset + i;
        const space: Space = {
          id: Builder.spaceId(spaceId),
          spaceType: this.spaceTypes[idx],
          x: xCoordinate,
          y: row.y,
          bonus: this.bonuses[idx] ?? [],
        };
        this.spaces.push(space);
        idx++;
      }
    }

    return this.spaces;
  }
  // SpaceId only allows 'm'+2 digits or a plain 2-3 digit number (see Types.ts's isSpaceId) --
  // no other letter prefix is valid, so unlike Moon's 'm' scheme, these are plain digits.
  // Starting at 200 keeps them clear of the Mars board's own numeric ids (which top out in the
  // 70s between the hex grid and its handful of off-grid colony spaces) even though, being a
  // fully separate Board instance, an actual collision wouldn't corrupt lookups either way.
  private static spaceId(id: number): SpaceId {
    return safeCast((200 + id).toString(), isSpaceId);
  }
}

class Row {
  constructor(private builder: Builder) {
  }

  land(...bonuses: Array<SpaceBonus>): this {
    this.builder.spaceTypes.push(SpaceType.LAND);
    this.builder.bonuses.push(bonuses);
    return this;
  }

  gaslight(...bonuses: Array<SpaceBonus>): this {
    this.builder.spaceTypes.push(SpaceType.GASLIGHT);
    this.builder.bonuses.push(bonuses);
    return this;
  }
}
