import {AssemblerValueVote, AssemblerVote, PriceGroup, VERDICT_INFO, priceGroup, votedTableValue, votedValue} from '../../common/assembler/AssemblerVotes';

/**
 * Assembler (fan): what rating-mode votes say about the value table.
 *
 * Each vote is one equation: "the card's parts, each kind scaled by its own factor, add up to the
 * value the vote says the card is worth". Solving all votes at once gives one factor per kind of
 * effect (1 = priced right, 0.8 = worth 20% less than the table says) and a flat offset for
 * every card (all cards feel too cheap or too expensive).
 *
 * Every factor is pulled toward 1 as if PRIOR_VOTES extra votes said the price was right, so a
 * kind of effect seen on two cards barely moves.
 */
export const PRIOR_VOTES = 3;

export type GroupResult = {
  group: PriceGroup,
  /** Votes on cards that have this kind of effect. */
  votes: number,
  /** Average verdict on those cards: +2 way too cheap … −2 way too expensive. */
  lean: number,
  /** Average M€ of this kind on a card that has it. */
  value: number,
  /** Scale this kind's values by this much. */
  factor: number,
};

export type VoteFit = {
  votes: number,
  groups: Array<GroupResult>,
  /** M€ every card should cost more (positive) or less (negative). */
  offset: number,
  /** Average distance between a card's price and its voted value, before and after the fit. */
  errorBefore: number,
  errorAfter: number,
};

type Row = {parts: Map<PriceGroup, number>, target: number};

function rowOf(vote: AssemblerVote): Row {
  const parts = new Map<PriceGroup, number>();
  for (const line of vote.assembled.breakdown) {
    const g = priceGroup(line);
    parts.set(g, (parts.get(g) ?? 0) + line.value);
  }
  // The lines are what the card does; the vote says what that's worth, judged against the shown
  // cost (which may have been shifted on purpose).
  return {parts, target: votedValue(vote)};
}

/** Solve A x = b by Gaussian elimination with partial pivoting. */
function solve(A: Array<Array<number>>, b: Array<number>): Array<number> {
  const n = b.length;
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
      if (r === c || A[c][c] === 0) {
        continue;
      }
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) {
        A[r][k] -= f * A[c][k];
      }
      b[r] -= f * b[c];
    }
  }
  return b.map((v, i) => (A[i][i] === 0 ? 0 : v / A[i][i]));
}

export function fitVotes(votes: ReadonlyArray<AssemblerVote>): VoteFit {
  const rows = votes.map(rowOf);
  const groups = [...new Set(rows.flatMap((r) => [...r.parts.keys()]))];
  const n = groups.length + 1; // the last unknown is the flat offset
  const A = Array.from({length: n}, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(0);
  for (const r of rows) {
    const x = [...groups.map((g) => r.parts.get(g) ?? 0), 1];
    for (let i = 0; i < n; i++) {
      b[i] += x[i] * r.target;
      for (let j = 0; j < n; j++) {
        A[i][j] += x[i] * x[j];
      }
    }
  }
  // Prior: factor 1 with the weight of PRIOR_VOTES typical cards; offset 0 likewise.
  groups.forEach((g, i) => {
    const seen = rows.map((r) => r.parts.get(g)).filter((v): v is number => v !== undefined && v !== 0);
    const typical = seen.length === 0 ? 1 : seen.reduce((s, v) => s + v * v, 0) / seen.length;
    A[i][i] += PRIOR_VOTES * typical;
    b[i] += PRIOR_VOTES * typical;
  });
  A[n - 1][n - 1] += PRIOR_VOTES;
  const x = solve(A, b);

  const price = (r: Row, f: (g: PriceGroup) => number, offset: number) =>
    [...r.parts].reduce((s, [g, v]) => s + f(g) * v, 0) + offset;
  const factor = new Map(groups.map((g, i) => [g, x[i]]));
  const offset = x[n - 1];
  const err = (f: (g: PriceGroup) => number, o: number) =>
    rows.reduce((s, r) => s + Math.abs(price(r, f, o) - r.target), 0) / Math.max(1, rows.length);

  const results: Array<GroupResult> = groups.map((g) => {
    const on = votes.filter((v) => v.assembled.breakdown.some((l) => priceGroup(l) === g));
    const lean = on.reduce((s, v) => s + VERDICT_INFO[v.verdict].steps, 0) / Math.max(1, on.length);
    const seen = rows.map((r) => r.parts.get(g)).filter((v): v is number => v !== undefined);
    const value = seen.reduce((s, v) => s + v, 0) / Math.max(1, seen.length);
    return {group: g, votes: on.length, lean, value, factor: factor.get(g) ?? 1};
  });
  // Biggest change in M€ on a typical card first.
  results.sort((a, b) => Math.abs((b.factor - 1) * b.value) - Math.abs((a.factor - 1) * a.value));
  return {
    votes: votes.length,
    groups: results,
    offset,
    errorBefore: err(() => 1, 0),
    errorAfter: err((g) => factor.get(g) ?? 1, offset),
  };
}

export type ValueResult = {
  key: string,
  label: string,
  votes: number,
  /** The table's number when the votes were cast (latest). */
  real: number,
  /** What the votes say it should be: the average voted value. */
  suggested: number,
  /** Average verdict, judged against the shown numbers. */
  lean: number,
};

/** Votes on single table values (Rate values): what each number should be. */
export function summarizeValueVotes(votes: ReadonlyArray<AssemblerValueVote>): Array<ValueResult> {
  const byKey = new Map<string, Array<AssemblerValueVote>>();
  for (const v of votes) {
    byKey.set(v.key, [...(byKey.get(v.key) ?? []), v]);
  }
  const avg = (ns: ReadonlyArray<number>) => ns.reduce((s, n) => s + n, 0) / Math.max(1, ns.length);
  return [...byKey.values()].map((vs) => {
    const latest = vs.reduce((a, b) => (b.at > a.at ? b : a));
    return {
      key: latest.key,
      label: latest.label,
      votes: vs.length,
      real: latest.real,
      suggested: avg(vs.map(votedTableValue)),
      lean: avg(vs.map((v) => VERDICT_INFO[v.verdict].steps)),
    };
  }).sort((a, b) => Math.abs(b.suggested - b.real) / Math.max(0.5, b.real) - Math.abs(a.suggested - a.real) / Math.max(0.5, a.real));
}

export type CalibrationRow = {count: number, lean: number};
export type Calibration = {down: CalibrationRow, none: CalibrationRow, up: CalibrationRow};

/**
 * The check on the votes: verdicts split by how the shown price was moved on purpose. Good votes
 * lean "too cheap" on prices moved down and "too expensive" on prices moved up.
 */
export function calibrate(items: ReadonlyArray<{shift: number, verdict: AssemblerVote['verdict']}>): Calibration {
  const row = (keep: (s: number) => boolean): CalibrationRow => {
    const steps = items.filter((i) => keep(i.shift)).map((i) => VERDICT_INFO[i.verdict].steps);
    return {count: steps.length, lean: steps.reduce((s, n) => s + n, 0) / Math.max(1, steps.length)};
  };
  return {down: row((s) => s < 0), none: row((s) => s === 0), up: row((s) => s > 0)};
}
