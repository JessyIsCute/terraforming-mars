import {Resource} from '../Resource';

/**
 * The permanent negative effect an Infection applies to the card it lands on -- the
 * negative counterpart to `MutationEffect`. Unlike mutations, every kind here is a flat
 * amount (no percent/clamp math) and applies unconditionally to any project card, since
 * there's no auction/requirement gating -- Blacklab Cartel's action just picks a target directly.
 */
export type InfectionEffect =
  /** Flat M€ cost increase, e.g. +4. */
  | {kind: 'costIncrease', amount: number}
  /** -amount VP, e.g. 1. Uncapped -- can push the card's total VP negative. */
  | {kind: 'victoryPointPenalty', amount: number}
  /**
   * A mandatory extra cost of `amount` `resource`, paid (and required) the moment the
   * card is played -- exactly like a Moon card's `reserveUnits` (e.g. Mare Imbrium Mine's
   * "Spend 1 titanium"). The card cannot be played at all without enough of `resource` in
   * stock; unlike a plain M€ cost, this can't be substituted with steel/titanium/etc.
   */
  | {kind: 'resourceCostOnPlay', resource: Resource, amount: number};
