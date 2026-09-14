import {SpaceBonus} from './SpaceBonus';
import {SpaceType} from './SpaceType';
import {
  MAX_SIMPLE_BOARD_NAME_LENGTH,
  SIMPLE_BOARD_SPACE_TYPES,
  SimpleBoardType,
  SimpleCustomBoardDefinition,
  SimpleCustomSpaceDef,
  simpleBoardLayout,
} from './SimpleCustomBoardDefinition';
import {bytesToBase64url, base64urlToBytes} from '../utils/base64url';

// Distinct from Mars's `TMB3…` prefix (customBoardCodec.ts) so the two families of code are never
// ambiguous, and the board type is still encoded inside so a Moon and a Venus code both start the
// same way.
const PREFIX = 'TMBS1';

export class SimpleBoardCodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimpleBoardCodecError';
  }
}

// The JSON shape actually put on the wire. Short keys, and bonus/space type are carried as their
// raw enum values (SpaceType is a string enum, SpaceBonus a numeric one) -- these boards are tiny
// (29-31 cells), so plain JSON + base64url keeps this codec far shorter than Mars's bit-packed
// one, at the cost of a longer code string. Position (x, y) is NOT carried per-cell -- the shape
// is fixed per board type (`simpleBoardLayout`), so `s` is just the ordered list of (type, bonus)
// pairs matching that layout.
interface WireDefinition {
  v: 1;
  t: SimpleBoardType;
  n: string;
  s: Array<[SpaceType, Array<number>]>;
}

export function encodeSimpleBoard(def: SimpleCustomBoardDefinition): string {
  validateSimpleBoard(def);
  const wire: WireDefinition = {
    v: 1,
    t: def.boardType,
    n: def.name,
    s: def.spaces.map((space): [SpaceType, Array<number>] => [space.spaceType, space.bonus]),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(wire));
  return PREFIX + bytesToBase64url(bytes);
}

export function decodeSimpleBoard(code: string): SimpleCustomBoardDefinition {
  if (!code.startsWith(PREFIX)) {
    throw new SimpleBoardCodecError('Not a recognized simple-board code');
  }
  let wire: WireDefinition;
  try {
    const bytes = base64urlToBytes(code.slice(PREFIX.length));
    wire = JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    throw new SimpleBoardCodecError('Malformed simple-board code');
  }
  if (wire === null || typeof wire !== 'object') {
    throw new SimpleBoardCodecError('Malformed simple-board code');
  }
  if (wire.v !== 1) {
    throw new SimpleBoardCodecError(`Unsupported simple-board code version ${wire.v}`);
  }
  if (wire.t !== 'moon' && wire.t !== 'venusPhase2') {
    throw new SimpleBoardCodecError(`Unknown board type '${wire.t}'`);
  }
  if (typeof wire.n !== 'string' || !Array.isArray(wire.s)) {
    throw new SimpleBoardCodecError('Malformed simple-board code');
  }
  const layout = simpleBoardLayout(wire.t);
  const def: SimpleCustomBoardDefinition = {
    version: 1,
    boardType: wire.t,
    name: wire.n,
    spaces: wire.s.map(([spaceType, bonus], i): SimpleCustomSpaceDef => ({
      x: layout[i]?.x ?? -1,
      y: layout[i]?.y ?? -1,
      spaceType,
      bonus,
    })),
  };
  validateSimpleBoard(def);
  return def;
}

export function validateSimpleBoard(def: SimpleCustomBoardDefinition): void {
  if (def.name.length === 0 || def.name.length > MAX_SIMPLE_BOARD_NAME_LENGTH) {
    throw new SimpleBoardCodecError(`Name must be 1-${MAX_SIMPLE_BOARD_NAME_LENGTH} characters`);
  }
  const layout = simpleBoardLayout(def.boardType);
  if (def.spaces.length !== layout.length) {
    throw new SimpleBoardCodecError(`Expected ${layout.length} spaces, got ${def.spaces.length}`);
  }
  const allowedTypes: ReadonlyArray<SpaceType> = SIMPLE_BOARD_SPACE_TYPES[def.boardType];
  for (let i = 0; i < def.spaces.length; i++) {
    const space = def.spaces[i];
    const expected = layout[i];
    if (space.x !== expected.x || space.y !== expected.y) {
      throw new SimpleBoardCodecError(
        `Space ${i} position mismatch: expected (${expected.x},${expected.y}), got (${space.x},${space.y})`);
    }
    if (!allowedTypes.includes(space.spaceType)) {
      throw new SimpleBoardCodecError(`Space type '${space.spaceType}' is not valid for board type '${def.boardType}'`);
    }
    for (const bonus of space.bonus) {
      if (typeof bonus !== 'number' || SpaceBonus[bonus] === undefined) {
        throw new SimpleBoardCodecError(`Invalid space bonus '${bonus}'`);
      }
    }
  }
}
