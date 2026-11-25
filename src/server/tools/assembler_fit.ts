/**
 * Assembler: fit the value table to the official cards.
 *
 * Every plain official card is one equation: "the values of everything on it = its cost + 3"
 * (a prelude's: "= the value of a prelude"). This solves all of them at once for the values
 * that fit best, and checks the result on cards it didn't see.
 *
 *   npx tsx src/server/tools/assembler_fit.ts [--markdown docs/assembler/fit-results.md]
 *
 * How it copes with messy data:
 * - Timing: production on a prelude pays out from generation 1, so it's worth more than on a
 *   mid-game card. A factor T (production on a prelude = T x its project-card value) is solved too.
 * - Outliers: some cards are simply strong or weak. Cards that miss by more than OUTLIER_AT M€
 *   count less (Huber weights), so they can't drag a value around on their own.
 * - Thin evidence: each value is pulled toward its current number as if PRIOR_WEIGHT extra cards
 *   agreed with it. A value seen on many cards moves freely; one seen on 1-2 cards barely moves.
 * - Tags: the most valuable tag counts fully and each other one 75%, which depends on the tag
 *   values themselves -- so the fit repeats (tags re-ranked each round) until nothing changes.
 * - Fixed by definition: 1 M€ = 1, cost = value - 3, the steel/titanium share of the cost.
 *
 * Only plain cards are used: no actions, effects, stored resources or custom code, and only
 * global-parameter or tag requirements. Everything else would need its own unknowns.
 */
import {ALL_MODULE_MANIFESTS} from '../cards/AllManifests';
import {ICard} from '../cards/ICard';
import {Tag} from '../../common/cards/Tag';
import {CardType} from '../../common/cards/CardType';
import {CardRequirementDescriptor} from '../../common/cards/CardRequirementDescriptor';
import {SeededRandom} from '../../common/utils/Random';
import * as V from '../assembler/AssemblerValues';
import * as fs from 'fs';

const OFFICIAL = ['base', 'corpera', 'promo', 'venus', 'colonies', 'prelude', 'prelude2', 'turmoil'];
const KNOWN_BEHAVIOR = new Set(['production', 'stock', 'tr', 'global', 'ocean', 'greenery', 'city', 'drawCard']);
/** Cards whose effect lives outside the card class (Turmoil, colonies, ...), so they look plain but aren't. */
const NOT_PLAIN = new Set(['Corridors of Power', 'Space Lanes', 'Suitable Infrastructure', 'Colony Trade Hub', 'Venus Contract', 'Terraforming Deal']);
/** Preludes that pay M€ in custom code but are otherwise plain. */
const PAYS: Record<string, number> = {'Galilean Mining': 5, 'Business Empire': 6, 'Huge Asteroid': 5, 'Aquifer Turbines': 3};

const PRIOR_WEIGHT = 1;
const OUTLIER_AT = 3;
const TIMING_PRIOR = 1;
const PRELUDE_PRIOR = 21;
const ROUNDS = 40;

const GLOBALS = {
  oxygen: {start: 0, max: 14},
  temperature: {start: -30, max: 8},
  oceans: {start: 0, max: 9},
  venus: {start: 0, max: 30},
} as const;

const TAGS: Array<Tag> = [Tag.BUILDING, Tag.SPACE, Tag.EARTH, Tag.SCIENCE, Tag.VENUS, Tag.PLANT, Tag.POWER, Tag.MICROBE, Tag.JOVIAN, Tag.CITY, Tag.ANIMAL, Tag.WILD];
const RESOURCES = ['megacredits', 'steel', 'titanium', 'plants', 'energy', 'heat'] as const;
type Resource = typeof RESOURCES[number];

/** The unknowns, their current values and how they read in the report. */
type Unknown = {key: string, label: string, now: number};
const UNKNOWNS: Array<Unknown> = [
  ...RESOURCES.map((r) => ({key: `prod.${r}`, label: `${r} production`, now: V.PRODUCTION_VALUE[r]})),
  ...RESOURCES.filter((r) => r !== 'megacredits').map((r) => ({key: `stock.${r}`, label: `1 ${r}`, now: V.STOCK_VALUE[r]})),
  {key: 'tr', label: 'TR', now: V.TR_VALUE},
  {key: 'temperature', label: 'temperature step', now: V.GLOBAL_STEP_VALUE.temperature},
  {key: 'oxygen', label: 'oxygen step', now: V.GLOBAL_STEP_VALUE.oxygen},
  {key: 'venus', label: 'Venus step', now: V.GLOBAL_STEP_VALUE.venus},
  {key: 'ocean', label: 'ocean tile', now: V.OCEAN_VALUE},
  {key: 'greenery', label: 'greenery tile', now: V.GREENERY_VALUE},
  {key: 'city', label: 'city tile', now: V.CITY_VALUE},
  {key: 'draw', label: 'draw a card', now: V.DRAW_CARD_VALUE},
  {key: 'vp', label: '1 VP', now: V.VP_VALUE},
  // A tag's value here includes the flat part of paying with steel/titanium.
  ...TAGS.map((t) => ({key: `tag.${t}`, label: `${t} tag`, now: (V.TAG_VALUE[t] ?? 0) + (V.PAYMENT_VALUE[t]?.flat ?? 0)})),
  {key: 'event', label: 'being an event (event tag)', now: V.EVENT_TAG_VALUE},
  {key: 'req.min', label: 'global requirement "at least" (x how late)', now: V.GLOBAL_MIN_REQUIREMENT},
  {key: 'req.max', label: 'global requirement "at most" (x how early)', now: V.GLOBAL_MAX_REQUIREMENT},
  {key: 'req.tag', label: 'tag requirement (x count^1.5)', now: -1},
  {key: 'prelude', label: 'value of a prelude', now: PRELUDE_PRIOR},
];
const INDEX = new Map(UNKNOWNS.map((u, i) => [u.key, i]));
function idx(key: string): number {
  const i = INDEX.get(key);
  if (i === undefined) {
    throw new Error(`Unknown value ${key}`);
  }
  return i;
}

/** A card as data: what's on it, before any values are applied. */
type CardData = {
  name: string,
  module: string,
  prelude: boolean,
  /** Project cards: cost + 3. Preludes: 0 (the 'prelude' unknown is on the other side). */
  target: number,
  /** Known M€ on the card: M€ gained or paid, the steel/titanium share of the cost. */
  fixed: number,
  /** Unknowns times how many: {'prod.steel': 2, 'ocean': 1, ...}. Not tags. */
  terms: Map<string, number>,
  tags: Array<Tag>,
  event: boolean,
};

function add(terms: Map<string, number>, key: string, n: number) {
  terms.set(key, (terms.get(key) ?? 0) + n);
}

/** Null when the card isn't plain enough to be an equation. */
function toData(card: ICard, module: string, prelude: boolean): CardData | null {
  const proto = Object.getPrototypeOf(card);
  const custom = Object.getOwnPropertyNames(proto).filter((n) => n !== 'constructor');
  if (NOT_PLAIN.has(card.name)) {
    return null;
  }
  const pays = PAYS[card.name];
  if (custom.length > 0 && pays === undefined) {
    return null;
  }
  if ((card as {action?: unknown}).action !== undefined || card.cardDiscount !== undefined || card.resourceType !== undefined) {
    return null;
  }
  if (card.type === CardType.ACTIVE || card.type === CardType.CORPORATION) {
    return null;
  }
  if (card.victoryPoints !== undefined && typeof card.victoryPoints !== 'number') {
    return null;
  }
  const b = card.behavior as Record<string, any> | undefined;
  if (b === undefined || Object.keys(b).length === 0) {
    return null;
  }
  if (Object.keys(b).some((k) => !KNOWN_BEHAVIOR.has(k))) {
    return null;
  }

  const terms = new Map<string, number>();
  let fixed = -(pays ?? 0);
  for (const [r, n] of Object.entries(b.production ?? {})) {
    if (typeof n !== 'number' || !RESOURCES.includes(r as Resource)) {
      return null;
    }
    add(terms, `prod.${r}`, n);
  }
  for (const [r, n] of Object.entries(b.stock ?? {})) {
    if (typeof n !== 'number' || !RESOURCES.includes(r as Resource)) {
      return null;
    }
    if (r === 'megacredits') {
      fixed += n;
    } else {
      add(terms, `stock.${r}`, n);
    }
  }
  if (b.tr !== undefined) {
    if (typeof b.tr !== 'number') {
      return null;
    }
    add(terms, 'tr', b.tr);
  }
  for (const [g, n] of Object.entries(b.global ?? {})) {
    if (typeof n !== 'number' || !['temperature', 'oxygen', 'venus'].includes(g)) {
      return null;
    }
    add(terms, g, n);
  }
  if (b.ocean !== undefined) {
    add(terms, 'ocean', b.ocean.count ?? 1);
  }
  if (b.greenery !== undefined) {
    add(terms, 'greenery', 1);
  }
  if (b.city !== undefined) {
    add(terms, 'city', 1);
  }
  if (b.drawCard !== undefined) {
    const n = typeof b.drawCard === 'number' ? b.drawCard : b.drawCard.count;
    if (typeof n !== 'number' || b.drawCard.keep !== undefined) {
      return null;
    }
    add(terms, 'draw', n);
  }
  if (typeof card.victoryPoints === 'number') {
    add(terms, 'vp', card.victoryPoints);
  }

  for (const r of card.requirements as ReadonlyArray<CardRequirementDescriptor>) {
    if (r.all === true) {
      return null;
    }
    const g = (Object.keys(GLOBALS) as Array<keyof typeof GLOBALS>).find((k) => r[k] !== undefined);
    if (g !== undefined) {
      const G = GLOBALS[g];
      const frac = ((r[g] as number) - G.start) / (G.max - G.start);
      if (r.max === true) {
        add(terms, 'req.max', 1 - frac);
      } else {
        add(terms, 'req.min', frac);
      }
    } else if (r.tag !== undefined && Object.keys(r).every((k) => k === 'tag' || k === 'count')) {
      add(terms, 'req.tag', Math.pow(r.count ?? 1, V.TAG_REQUIREMENT_EXPONENT));
    } else {
      return null;
    }
  }

  const event = card.type === CardType.EVENT;
  const tags = card.tags.filter((t) => t !== Tag.EVENT);
  if (tags.some((t) => !TAGS.includes(t))) {
    return null;
  }
  const cost = card.cost ?? 0;
  for (const t of tags) {
    fixed += (V.PAYMENT_VALUE[t]?.ofCost ?? 0) * cost;
  }
  if (event) {
    add(terms, 'event', 1);
  }
  return {name: card.name, module, prelude, target: prelude ? 0 : cost + V.BUY_COST, fixed, terms, tags, event};
}

function loadCards(): Array<CardData> {
  const cards: Array<CardData> = [];
  for (const m of ALL_MODULE_MANIFESTS) {
    if (!OFFICIAL.includes(m.module)) {
      continue;
    }
    for (const spec of Object.values(m.projectCards)) {
      const d = toData(new spec.Factory(), m.module, false);
      if (d !== null) {
        cards.push(d);
      }
    }
    for (const spec of Object.values(m.preludeCards)) {
      const d = toData(new spec.Factory(), m.module, true);
      if (d !== null) {
        cards.push(d);
      }
    }
  }
  return cards;
}

type Fit = {values: Array<number>, timing: number};

/** One card's equation as coefficients on the unknowns, given the current values (for tag ranking) and timing. */
function row(card: CardData, fit: Fit): {x: Array<number>, y: number} {
  const x = new Array<number>(UNKNOWNS.length).fill(0);
  for (const [k, n] of card.terms) {
    const i = idx(k);
    x[i] += card.prelude && k.startsWith('prod.') ? n * fit.timing : n;
  }
  // Tags: best one fully, the rest at EXTRA_TAG_FACTOR; on an event all at EVENT_TAG_FACTOR.
  const ranked = [...card.tags].sort((a, b) => fit.values[idx(`tag.${b}`)] - fit.values[idx(`tag.${a}`)]);
  ranked.forEach((t, i) => {
    const w = (i === 0 ? 1 : V.EXTRA_TAG_FACTOR) * (card.event ? V.EVENT_TAG_FACTOR : 1);
    x[idx(`tag.${t}`)] += w;
  });
  if (card.prelude) {
    x[idx('prelude')] -= 1;
  }
  return {x, y: card.target - card.fixed};
}

function predict(card: CardData, fit: Fit): number {
  const {x, y} = row(card, fit);
  return x.reduce((s, xi, i) => s + xi * fit.values[i], 0) - y;
}

/** Solve (X'WX + λI) v = X'Wy + λ prior. */
function solve(rows: Array<{x: Array<number>, y: number, w: number}>): Array<number> {
  const n = UNKNOWNS.length;
  const A = Array.from({length: n}, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(0);
  for (const r of rows) {
    for (let i = 0; i < n; i++) {
      if (r.x[i] === 0) {
        continue;
      }
      b[i] += r.w * r.x[i] * r.y;
      for (let j = 0; j < n; j++) {
        A[i][j] += r.w * r.x[i] * r.x[j];
      }
    }
  }
  UNKNOWNS.forEach((u, i) => {
    A[i][i] += PRIOR_WEIGHT;
    b[i] += PRIOR_WEIGHT * u.now;
  });
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) {
      if (Math.abs(A[r][c]) > Math.abs(A[p][c])) {
        p = r;
      }
    }
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) {
        continue;
      }
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) {
        A[r][k] -= f * A[c][k];
      }
      b[r] -= f * b[c];
    }
  }
  return b.map((v, i) => v / A[i][i]);
}

function huber(residual: number): number {
  const a = Math.abs(residual);
  return a <= OUTLIER_AT ? 1 : OUTLIER_AT / a;
}

/** Repeat: re-rank tags, re-weight outliers, solve the values, then solve the timing factor. */
export function fitValues(cards: Array<CardData>): Fit {
  let fit: Fit = {values: UNKNOWNS.map((u) => u.now), timing: TIMING_PRIOR};
  for (let round = 0; round < ROUNDS; round++) {
    const rows = cards.map((c) => ({...row(c, fit), w: huber(predict(c, fit))}));
    const values = solve(rows);
    // Timing: with values fixed, the best T for the preludes' production (pulled toward 1).
    let num = PRIOR_WEIGHT * TIMING_PRIOR;
    let den = PRIOR_WEIGHT;
    for (const c of cards.filter((c) => c.prelude)) {
      const prod = [...c.terms].filter(([k]) => k.startsWith('prod.')).reduce((s, [k, n]) => s + n * values[idx(k)], 0);
      if (prod === 0) {
        continue;
      }
      const rest = predict(c, {values, timing: 0}); // everything but the production
      const w = huber(predict(c, {values, timing: fit.timing}));
      num += w * prod * -rest;
      den += w * prod * prod;
    }
    const next = {values, timing: num / den};
    const moved = Math.max(Math.abs(next.timing - fit.timing), ...values.map((v, i) => Math.abs(v - fit.values[i])));
    fit = next;
    if (moved < 1e-4) {
      break;
    }
  }
  return fit;
}

function mae(cards: Array<CardData>, fit: Fit): number {
  return cards.reduce((s, c) => s + Math.abs(predict(c, fit)), 0) / Math.max(1, cards.length);
}

/** 5-fold check: fit on 80% of the cards, measure the error on the other 20%, five times. */
function crossValidate(cards: Array<CardData>): {now: number, fitted: number} {
  const rng = new SeededRandom(0.42);
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const current: Fit = {values: UNKNOWNS.map((u) => u.now), timing: 1};
  let now = 0;
  let fitted = 0;
  for (let k = 0; k < 5; k++) {
    const test = shuffled.filter((_, i) => i % 5 === k);
    const train = shuffled.filter((_, i) => i % 5 !== k);
    const fit = fitValues(train);
    now += mae(test, current) * test.length;
    fitted += mae(test, fit) * test.length;
  }
  return {now: now / cards.length, fitted: fitted / cards.length};
}

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function report(): string {
  const cards = loadCards();
  const fit = fitValues(cards);
  const current: Fit = {values: UNKNOWNS.map((u) => u.now), timing: 1};
  const cv = crossValidate(cards);
  const lines: Array<string> = [];
  const preludes = cards.filter((c) => c.prelude).length;
  lines.push('# Assembler value fit', '');
  lines.push(`${cards.length} plain official cards (${cards.length - preludes} project cards, ${preludes} preludes). Generated by \`src/server/tools/assembler_fit.ts\`.`, '');
  lines.push('## How well it predicts', '');
  lines.push('| | Current table | Fitted |', '|---|---:|---:|');
  lines.push(`| Average error on the cards it was fitted to | ${fmt(mae(cards, current))} M€ | ${fmt(mae(cards, fit))} M€ |`);
  lines.push(`| Average error on cards it didn't see (5-fold) | ${fmt(cv.now)} M€ | ${fmt(cv.fitted)} M€ |`);
  lines.push(`| Production on a prelude, compared with a project card | 1.0x | ${fmt(fit.timing)}x |`, '');
  lines.push('## Values', '');
  lines.push('Cards: how many plain cards have it. Few cards = weak evidence; those values barely move from the current table by design.', '');
  lines.push('| Value | Now | Fitted | Change | Cards |', '|---|---:|---:|---:|---:|');
  UNKNOWNS.forEach((u, i) => {
    const support = cards.filter((c) => (u.key.startsWith('tag.') ? c.tags.includes(u.key.slice(4) as Tag) : u.key === 'prelude' ? c.prelude : c.terms.has(u.key))).length;
    const change = fit.values[i] - u.now;
    const mark = Math.abs(change) >= 1 && support >= 5 ? ' **' : '';
    lines.push(`| ${u.label} | ${fmt(u.now)} | ${mark}${fmt(fit.values[i])}${mark.trim()} | ${change >= 0 ? '+' : ''}${fmt(change)} | ${support} |`);
  });
  lines.push('');
  const misfits = cards.map((c) => ({c, r: predict(c, fit)})).sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 15);
  lines.push('## Cards that disagree most with the fit', '');
  lines.push('Positive: the card gives more than its cost says (strong). Negative: it gives less (weak).', '');
  lines.push('| Card | Module | Cost | Fitted value − (cost + 3) |', '|---|---|---:|---:|');
  for (const {c, r} of misfits) {
    lines.push(`| ${c.name} | ${c.module} | ${c.prelude ? 'prelude' : c.target - V.BUY_COST} | ${r >= 0 ? '+' : ''}${fmt(r)} |`);
  }
  return lines.join('\n') + '\n';
}

function main() {
  const out = report();
  const i = process.argv.indexOf('--markdown');
  if (i >= 0 && process.argv[i + 1] !== undefined) {
    fs.writeFileSync(process.argv[i + 1], out);
    console.log(`Wrote ${process.argv[i + 1]}`);
  }
  console.log(out);
}

if (require.main === module) {
  main();
}
