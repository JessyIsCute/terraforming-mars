import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {SpaceType} from '../../common/boards/SpaceType';
import {SpaceId, isSpaceId, safeCast} from '../../common/Types';
import {GameOptions} from '../../server/game/GameOptions';
import {Random} from '../../common/utils/Random';
import {CardName} from '../../common/cards/CardName';

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
    // A modest, roughly-Moon-sized surface: mostly open land for Cloud City/Floater Array, with
    // a handful of gaslight spaces reserved for Gas Mine scattered through it.
    b.row(2).land().land().gaslight().land();
    b.row(1).land().gaslight().land().land().land();
    b.row(0).land().land().gaslight().land().land().land();
    b.row(0).land().land().land().gaslight().land();
    b.row(1).land().land().gaslight().land().land();
    b.row(2).land().gaslight().land().land();

    const spaces = b.build(gameOptions);
    return new VenusSurfaceBoard(spaces);
  }
}

class Builder {
  y: number = -1;
  x: number = 0;
  spaceTypes: Array<SpaceType> = [];
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

    const tilesPerRow = [4, 5, 6, 5, 5, 4];
    const idOffset = 1;
    let idx = 0;

    for (let row = 0; row < tilesPerRow.length; row++) {
      const tilesInThisRow = tilesPerRow[row];
      const xOffset = 6 - tilesInThisRow;
      for (let i = 0; i < tilesInThisRow; i++) {
        const spaceId = idx + idOffset;
        const xCoordinate = xOffset + i;
        const space: Space = {
          id: Builder.spaceId(spaceId),
          spaceType: this.spaceTypes[idx],
          x: xCoordinate,
          y: row,
          bonus: [],
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

  land(): this {
    this.builder.spaceTypes.push(SpaceType.LAND);
    return this;
  }

  gaslight(): this {
    this.builder.spaceTypes.push(SpaceType.GASLIGHT);
    return this;
  }
}
