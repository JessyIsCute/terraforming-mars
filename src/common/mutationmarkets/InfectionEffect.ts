import {Resource} from '../Resource';

/**
 * The permanent negative effect an Infection applies to the card it lands on -- the
 * negative counterpart to `MutationEffect`. Unlike mutations, every kind here is a flat
 * amount (no percent/clamp math) and applies unconditionally to any project card, since
 * there's no auction/requirement gating -- Pandemica's action just picks a target directly.
 */
export type InfectionEffect =
  /** Flat M€ cost increase, e.g. +4. */
  | {kind: 'costIncrease', amount: number}
  /** -amount VP, e.g. 1. Uncapped -- can push the card's total VP negative. */
  | {kind: 'victoryPointPenalty', amount: number}
  /** Loses `amount` of `resource` from stock (not production) the first time it's played. */
  | {kind: 'resourceDrainOnPlay', resource: Resource, amount: number};
