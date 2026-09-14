import {SpaceBonus} from './SpaceBonus';
import {SpaceType} from './SpaceType';

/**
 * A user-authored Moon or Venus Phase 2 surface board. Produced by the map editor
 * (`?board=moon`/`?board=venus`), serialized into a share code by `simpleBoardCodec`, and carried
 * on `GameOptions.customMoonBoard`/`customVenusSurfaceBoard` for the life of a game.
 *
 * Unlike Mars's `CustomBoardDefinition`, the grid SHAPE is fixed per board type -- it matches
 * `MoonBoard.ts`'s/`VenusSurfaceBoard.ts`'s own hard-coded tile layout exactly (see
 * `simpleBoardLayout` below) -- only each cell's space type and bonus icons are editable. Neither
 * board supports arbitrary outline-carving, global parameters, milestones/awards, or
 * placement-bonus costs, so none of that lives here.
 */
export type SimpleBoardType = 'moon' | 'venusPhase2';

export interface SimpleCustomSpaceDef {
  x: number;
  y: number;
  spaceType: SpaceType;
  bonus: Array<SpaceBonus>;
}

export interface SimpleCustomBoardDefinition {
  version: 1;
  boardType: SimpleBoardType;
  /** Display name; shown in the create-game form. */
  name: string;
  /** One entry per grid cell, in the same order as `simpleBoardLayout(boardType)`. */
  spaces: Array<SimpleCustomSpaceDef>;
}

export const MAX_SIMPLE_BOARD_NAME_LENGTH = 24;

/** The two paintable space types for each simple board type, in tool-palette order. */
export const SIMPLE_BOARD_SPACE_TYPES: Record<SimpleBoardType, [SpaceType, SpaceType]> = {
  moon: [SpaceType.LAND, SpaceType.LUNAR_MINE],
  venusPhase2: [SpaceType.LAND, SpaceType.GASLIGHT],
};

/**
 * The fixed (x, y) grid layout for a simple board type, in row-major order. Must match the
 * `tilesPerRow` arrays and offset math in `MoonBoard.ts`'s/`VenusSurfaceBoard.ts`'s own `Builder`
 * exactly -- this is the single source of truth both the codec/validator and the board classes'
 * custom-definition path read from, so the two can never drift apart.
 */
export function simpleBoardLayout(boardType: SimpleBoardType): Array<{x: number, y: number}> {
  const tilesPerRow = boardType === 'moon' ? [4, 5, 6, 5, 6, 5, 4] : [3, 4, 5, 6, 5, 4, 3];
  const layout: Array<{x: number, y: number}> = [];
  for (let row = 0; row < tilesPerRow.length; row++) {
    const tilesInThisRow = tilesPerRow[row];
    // Moon's row 3 (0-based) is a "central line 0-based x coord" special case -- see the
    // identical comment in MoonBoard.ts's own Builder.build().
    const xOffset = boardType === 'moon' && row === 3 ? 0 : 6 - tilesInThisRow;
    for (let i = 0; i < tilesInThisRow; i++) {
      layout.push({x: xOffset + i, y: row});
    }
  }
  return layout;
}

/** An all-LAND starting point for the map editor (and a convenient test fixture). */
export function blankSimpleBoard(boardType: SimpleBoardType, name: string): SimpleCustomBoardDefinition {
  const spaces = simpleBoardLayout(boardType).map((pos): SimpleCustomSpaceDef => ({
    x: pos.x,
    y: pos.y,
    spaceType: SpaceType.LAND,
    bonus: [],
  }));
  return {version: 1, boardType, name, spaces};
}
