import {EffectCategory} from './EffectCategory';
import {AssembledCardInfo} from '../models/CardModel';

/**
 * Assembler (fan): the rating mode on the generator page. You see one generated card at a time
 * and say whether its cost is right. Votes stay in the browser until you download them; the
 * vote fit (src/server/tools/assembler_votes.ts) turns them into suggested value changes.
 */

/** Where the page keeps your votes (localStorage). */
export const ASSEMBLER_VOTES_STORAGE_KEY = 'assemblerVotes';
export const ASSEMBLER_VALUE_VOTES_STORAGE_KEY = 'assemblerValueVotes';

export const VERDICTS = ['much-too-cheap', 'too-cheap', 'fair', 'too-expensive', 'much-too-expensive'] as const;
export type Verdict = typeof VERDICTS[number];

/** steps: how many 15% steps the real value is above (+) or below (−) what was shown. */
export const VERDICT_INFO: Record<Verdict, {label: string, valueLabel: string, key: string, steps: number}> = {
  'much-too-cheap': {label: 'Way too cheap', valueLabel: 'Worth much more', key: '1', steps: 2},
  'too-cheap': {label: 'Too cheap', valueLabel: 'Worth more', key: '2', steps: 1},
  'fair': {label: 'About right', valueLabel: 'About right', key: '3', steps: 0},
  'too-expensive': {label: 'Too expensive', valueLabel: 'Worth less', key: '4', steps: -1},
  'much-too-expensive': {label: 'Way too expensive', valueLabel: 'Worth much less', key: '5', steps: -2},
};

export function isVerdict(v: unknown): v is Verdict {
  return typeof v === 'string' && (VERDICTS as ReadonlyArray<string>).includes(v);
}

export type AssemblerVote = {
  /** The card's name, e.g. "Assembled preview-4182-3": the seed and position that made it. */
  card: string,
  title: string,
  cost: number,
  verdict: Verdict,
  assembled: AssembledCardInfo,
  /** How far the shown cost was moved on purpose from the card's real price (0: not moved). */
  shift?: number,
  /** When it was rated (ms since 1970). */
  at: number,
};

/** A vote on one number from the value table (see RateableValue). */
export type AssemblerValueVote = {
  key: string,
  label: string,
  /** The number shown, which may have been moved on purpose. */
  shown: number,
  /** The table's real number at the time. */
  real: number,
  verdict: Verdict,
  at: number,
};

export type AssemblerVoteFile = {
  version: 1,
  votes: Array<AssemblerVote>,
  valueVotes?: Array<AssemblerValueVote>,
};

/** How far one step of a verdict moves the fair cost: 15% of the value, at least 2 M€. */
export const VERDICT_STEP = {share: 0.15, min: 2} as const;

/** What a card is really worth (its fair value, cost + 3) according to the vote. The vote judges the cost that was shown. */
export function votedValue(vote: AssemblerVote): number {
  const value = vote.cost + 3;
  const steps = VERDICT_INFO[vote.verdict].steps;
  return value + steps * Math.max(VERDICT_STEP.min, VERDICT_STEP.share * value);
}

/** Parts of a price that aren't an effect. */
export type PriceGroup = EffectCategory | 'tags' | 'requirement' | 'payment';

/** Which group a breakdown line belongs to: its effect category, or what kind of line it is. */
export function priceGroup(line: AssembledCardInfo['breakdown'][number]): PriceGroup {
  if (line.category !== undefined) {
    return line.category;
  }
  if (line.text.startsWith('Tags:')) {
    return 'tags';
  }
  if (line.text.startsWith('Pay with')) {
    return 'payment';
  }
  return 'requirement';
}

/** What a table value should be according to the vote: 15% of the shown number per step (at least 0.2). */
export function votedTableValue(vote: Pick<AssemblerValueVote, 'shown' | 'verdict'>): number {
  return vote.shown + VERDICT_INFO[vote.verdict].steps * Math.max(0.2, VERDICT_STEP.share * Math.abs(vote.shown));
}

/** Rating mode's deliberate mispricing of a table value: like the card spread, rounded to 0.1. */
export function shiftTableValue(value: number, random: () => number): number {
  if (random() < 0.4) {
    return value;
  }
  const size = Math.abs(value) * (0.15 + random() * 0.25);
  const shifted = value + Math.max(0.2, size) * (random() < 0.5 ? -1 : 1);
  return Math.max(0.1, Math.round(shifted * 10) / 10);
}
