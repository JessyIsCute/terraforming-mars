import {SpaceBonus} from './SpaceBonus';
import {SpaceType} from './SpaceType';
import {
  CustomBoardDefinition,
  CustomSpaceDef,
  MAX_CUSTOM_NAME_LENGTH,
  MAX_CUSTOM_ROWS,
  MIN_CUSTOM_ROWS,
  customSpaceId,
  hexRowLayout,
} from './CustomBoardDefinition';
import {DEFAULT_GLOBAL_PARAMETERS, GlobalParametersConfig, ParameterBonus, ParameterTrack} from '../GlobalParameterConfig';
import {milestoneNames, MilestoneName} from '../ma/MilestoneName';
import {awardNames, AwardName} from '../ma/AwardName';

const PREFIX = 'TMB2';
const FORMAT_VERSION = 2;

export class CustomBoardCodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomBoardCodecError';
  }
}

// --- SpaceType <-> small int (3 bits) ------------------------------------------------------

const SPACE_TYPE_CODES: ReadonlyArray<SpaceType> = [
  SpaceType.LAND,
  SpaceType.OCEAN,
  SpaceType.COVE,
  SpaceType.RESTRICTED,
  SpaceType.DEFLECTION_ZONE,
];

// --- ParameterBonus kind <-> small int --------------------------------------------------

const BONUS_KINDS: ReadonlyArray<ParameterBonus['kind']> = ['ocean', 'temperature', 'heatProduction', 'card', 'tr'];

// --- byte i/o -------------------------------------------------------------------------------

class ByteWriter {
  private bytes: Array<number> = [];
  u8(v: number): void {
    this.bytes.push(v & 0xff);
  }
  i16(v: number): void {
    // little-endian, two's complement
    const u = v < 0 ? v + 0x10000 : v;
    this.bytes.push(u & 0xff, (u >> 8) & 0xff);
  }
  str(s: string): void {
    const encoded = new TextEncoder().encode(s);
    if (encoded.length > 0xff) {
      throw new CustomBoardCodecError('String too long to encode');
    }
    this.u8(encoded.length);
    for (const b of encoded) {
      this.bytes.push(b);
    }
  }
  toBytes(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

class ByteReader {
  private pos = 0;
  constructor(private readonly bytes: Uint8Array) {}
  u8(): number {
    if (this.pos >= this.bytes.length) {
      throw new CustomBoardCodecError('Unexpected end of data');
    }
    return this.bytes[this.pos++];
  }
  i16(): number {
    const lo = this.u8();
    const hi = this.u8();
    const u = lo | (hi << 8);
    return u >= 0x8000 ? u - 0x10000 : u;
  }
  str(): string {
    const len = this.u8();
    if (this.pos + len > this.bytes.length) {
      throw new CustomBoardCodecError('Unexpected end of string data');
    }
    const slice = this.bytes.subarray(this.pos, this.pos + len);
    this.pos += len;
    return new TextDecoder().decode(slice);
  }
  atEnd(): boolean {
    return this.pos >= this.bytes.length;
  }
}

// --- base64url (no padding), dependency-free ---------------------------------------------

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function bytesToBase64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (b0 << 16) | (b1 << 8) | b2;
    out += B64[(triple >> 18) & 63] + B64[(triple >> 12) & 63];
    if (i + 1 < bytes.length) {
      out += B64[(triple >> 6) & 63];
    }
    if (i + 2 < bytes.length) {
      out += B64[triple & 63];
    }
  }
  return out;
}

function base64urlToBytes(s: string): Uint8Array {
  const bytes: Array<number> = [];
  for (let i = 0; i < s.length; i += 4) {
    const c0 = B64.indexOf(s[i]);
    const c1 = B64.indexOf(s[i + 1]);
    const c2 = i + 2 < s.length ? B64.indexOf(s[i + 2]) : -1;
    const c3 = i + 3 < s.length ? B64.indexOf(s[i + 3]) : -1;
    if (c0 < 0 || c1 < 0) {
      throw new CustomBoardCodecError('Invalid character in map code');
    }
    bytes.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) {
      bytes.push(((c1 & 15) << 4) | (c2 >> 2));
    }
    if (c3 >= 0) {
      bytes.push(((c2 & 3) << 6) | c3);
    }
  }
  return Uint8Array.from(bytes);
}

// --- track encode/decode --------------------------------------------------------------------

function writeTrack(w: ByteWriter, track: ParameterTrack): void {
  w.i16(track.min);
  w.i16(track.max);
  w.u8(track.step);
  w.u8(track.bonuses.length);
  for (const bonus of track.bonuses) {
    w.u8(BONUS_KINDS.indexOf(bonus.kind));
    w.i16(bonus.value);
    w.u8('amount' in bonus ? bonus.amount : 0);
  }
}

function readTrack(r: ByteReader): ParameterTrack {
  const min = r.i16();
  const max = r.i16();
  const step = r.u8();
  const count = r.u8();
  const bonuses: Array<ParameterBonus> = [];
  for (let i = 0; i < count; i++) {
    const kind = BONUS_KINDS[r.u8()];
    const value = r.i16();
    const amount = r.u8();
    if (kind === undefined) {
      throw new CustomBoardCodecError('Unknown parameter bonus kind');
    }
    if (kind === 'ocean' || kind === 'temperature') {
      bonuses.push({value, kind});
    } else {
      bonuses.push({value, kind, amount});
    }
  }
  return {min, max, step, bonuses};
}

// --- public API ---------------------------------------------------------------------------

export function encodeCustomBoard(def: CustomBoardDefinition): string {
  const w = new ByteWriter();
  w.u8(FORMAT_VERSION);
  w.u8(def.rows);
  w.str(def.name);

  const layout = hexRowLayout(def.rows);
  const byCoord = new Map<string, CustomSpaceDef>();
  for (const space of def.spaces) {
    byCoord.set(`${space.x},${space.y}`, space);
  }

  // Grid: one byte per bounding-hexagon cell, row-major.
  const present: Array<CustomSpaceDef> = [];
  for (const row of layout) {
    for (let i = 0; i < row.width; i++) {
      const space = byCoord.get(`${row.xOffset + i},${row.y}`);
      if (space === undefined) {
        w.u8(0);
        continue;
      }
      const typeCode = SPACE_TYPE_CODES.indexOf(space.spaceType);
      if (typeCode < 0) {
        throw new CustomBoardCodecError(`Space type ${space.spaceType} is not valid on a custom board`);
      }
      let b = 1;
      b |= typeCode << 1;
      if (space.volcanic) {
        b |= 1 << 4;
      }
      if (space.reserved) {
        b |= 1 << 5;
      }
      w.u8(b);
      present.push(space);
    }
  }

  // Bonuses for present spaces, in the same row-major order.
  for (const space of present) {
    w.u8(space.bonus.length);
    for (const bonus of space.bonus) {
      w.u8(bonus);
    }
  }

  // Milestones / awards by name (stable across list reordering).
  w.u8(def.milestones.length);
  for (const name of def.milestones) {
    w.str(name);
  }
  w.u8(def.awards.length);
  for (const name of def.awards) {
    w.str(name);
  }

  // Global parameters.
  if (def.globalParameters === undefined) {
    w.u8(0);
  } else {
    w.u8(1);
    writeTrack(w, def.globalParameters.temperature);
    writeTrack(w, def.globalParameters.oxygen);
    writeTrack(w, def.globalParameters.venus);
    w.u8(def.globalParameters.oceans.max);
    w.u8(def.globalParameters.heatForTemperature);
  }

  return PREFIX + bytesToBase64url(w.toBytes());
}

export function decodeCustomBoard(code: string): CustomBoardDefinition {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX)) {
    throw new CustomBoardCodecError(`Map code must start with ${PREFIX}`);
  }
  const r = new ByteReader(base64urlToBytes(trimmed.slice(PREFIX.length)));

  const formatVersion = r.u8();
  if (formatVersion !== FORMAT_VERSION) {
    throw new CustomBoardCodecError(`Unsupported map code version ${formatVersion}`);
  }
  const rows = r.u8();
  if (rows < MIN_CUSTOM_ROWS || rows > MAX_CUSTOM_ROWS || rows % 2 === 0) {
    throw new CustomBoardCodecError(`Row count ${rows} is out of range or even`);
  }
  const name = r.str();
  if (name.length > MAX_CUSTOM_NAME_LENGTH) {
    throw new CustomBoardCodecError('Board name too long');
  }

  const layout = hexRowLayout(rows);
  const cells: Array<{x: number, y: number, byte: number}> = [];
  for (const row of layout) {
    for (let i = 0; i < row.width; i++) {
      cells.push({x: row.xOffset + i, y: row.y, byte: r.u8()});
    }
  }

  // Ids are positional: the Nth present space (row-major) is always customSpaceId(N).
  const spaces: Array<CustomSpaceDef> = [];
  for (const cell of cells) {
    if ((cell.byte & 1) === 0) {
      continue;
    }
    const spaceType = SPACE_TYPE_CODES[(cell.byte >> 1) & 0b111];
    if (spaceType === undefined) {
      throw new CustomBoardCodecError('Unknown space type in map code');
    }
    const space: CustomSpaceDef = {
      id: customSpaceId(spaces.length),
      x: cell.x,
      y: cell.y,
      spaceType,
      bonus: [],
    };
    if (cell.byte & (1 << 4)) {
      space.volcanic = true;
    }
    if (cell.byte & (1 << 5)) {
      space.reserved = true;
    }
    spaces.push(space);
  }

  for (const space of spaces) {
    const count = r.u8();
    for (let i = 0; i < count; i++) {
      const bonus = r.u8() as SpaceBonus;
      if (SpaceBonus[bonus] === undefined) {
        throw new CustomBoardCodecError('Unknown space bonus in map code');
      }
      space.bonus.push(bonus);
    }
  }

  const milestones = readNames(r, (n): n is MilestoneName => (milestoneNames as ReadonlyArray<string>).includes(n), 'milestone');
  const awards = readNames(r, (n): n is AwardName => (awardNames as ReadonlyArray<string>).includes(n), 'award');

  const def: CustomBoardDefinition = {version: 1, name, rows, spaces, milestones, awards};

  const hasGlobalParameters = r.u8();
  if (hasGlobalParameters === 1) {
    const temperature = readTrack(r);
    const oxygen = readTrack(r);
    const venus = readTrack(r);
    const oceans = {max: r.u8()};
    const heatForTemperature = r.u8();
    def.globalParameters = {temperature, oxygen, venus, oceans, heatForTemperature};
  }

  return def;
}

function readNames<T extends string>(r: ByteReader, guard: (n: string) => n is T, label: string): Array<T> {
  const count = r.u8();
  const names: Array<T> = [];
  for (let i = 0; i < count; i++) {
    const name = r.str();
    if (!guard(name)) {
      throw new CustomBoardCodecError(`Unknown ${label} "${name}" in map code`);
    }
    names.push(name);
  }
  return names;
}

/**
 * Non-fatal sanity checks. Returns human-readable warning strings for the editor to display;
 * an empty array means nothing looks off.
 */
export function validateCustomBoard(def: CustomBoardDefinition): Array<string> {
  const warnings: Array<string> = [];
  const oceanSpaces = def.spaces.filter((s) => s.spaceType === SpaceType.OCEAN || s.spaceType === SpaceType.COVE);
  const oceanMax = def.globalParameters?.oceans.max ?? DEFAULT_GLOBAL_PARAMETERS.oceans.max;

  if (def.spaces.length === 0) {
    warnings.push('The board has no spaces.');
  }
  if (oceanSpaces.length === 0) {
    warnings.push('The board has no ocean spaces.');
  }
  if (oceanSpaces.length < oceanMax) {
    warnings.push(`Only ${oceanSpaces.length} ocean spaces for a maximum of ${oceanMax} ocean tiles.`);
  }
  if (def.milestones.length !== 0 && def.milestones.length !== 5) {
    warnings.push('Milestones should be exactly 5, or empty for a random set.');
  }
  if (def.awards.length !== 0 && def.awards.length !== 5) {
    warnings.push('Awards should be exactly 5, or empty for a random set.');
  }
  for (const [key, track] of trackEntries(def.globalParameters)) {
    if ((track.max - track.min) % track.step !== 0) {
      warnings.push(`The ${key} track max is not reachable from its min in whole steps.`);
    }
    for (const bonus of track.bonuses) {
      if (bonus.value < track.min || bonus.value > track.max) {
        warnings.push(`A ${key} bonus at ${bonus.value} is outside the track range.`);
      }
    }
  }
  return warnings;
}

function trackEntries(config: GlobalParametersConfig | undefined): Array<[string, ParameterTrack]> {
  if (config === undefined) {
    return [];
  }
  return [
    ['temperature', config.temperature],
    ['oxygen', config.oxygen],
    ['venus', config.venus],
  ];
}
