import {EffectCategory} from './EffectCategory';
import {AssembledCardInfo} from '../models/CardModel';

/**
 * Assembler (fan): the rating mode on the generator page. You see one generated card at a time
 * and say whether its cost is right. Votes stay in the browser until you download them; the
 * vote fit (src/server/tools/assembler_votes.ts) turns them into suggested value changes.
 */

/** Where the page keeps your votes (localStorage). */
export const ASSEMBLER_VOTES_STORAGE_KEY = 'assemblerVotes';

export const VERDICTS = ['much-too-cheap', 'too-cheap', 'fair', 'too-expensive', 'much-too-expensive'] as const;
export type Verdict = typeof VERDICTS[number];

export const VERDICT_INFO: Record<Verdict, {label: string, key: string, steps: number}> = {
  'much-too-cheap': {label: 'Way too cheap', key: '1', steps: 2},
  'too-cheap': {label: 'Too cheap', key: '2', steps: 1},
  'fair': {label: 'About right', key: '3', steps: 0},
  'too-expensive': {label: 'Too expensive', key: '4', steps: -1},
  'much-too-expensive': {label: 'Way too expensive', key: '5', steps: -2},
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
  /** When it was rated (ms since 1970). */
  at: number,
};

export type AssemblerVoteFile = {
  version: 1,
  votes: Array<AssemblerVote>,
};

/** How far one step of a verdict moves the fair cost: 15% of the value, at least 2 M€. */
export const VERDICT_STEP = {share: 0.15, min: 2} as const;

/** What a card is really worth (its fair value, cost + 3) according to the vote. */
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
