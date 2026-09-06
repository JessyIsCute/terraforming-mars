/**
 * The permanent, ongoing effect a mutation applies to the project card it covers, once won.
 *
 * Phase 4 (client UI) note: which part of the card gets the green glowing-text treatment
 * is fully derivable from `kind` -- no separate field needed. `addRandomTag` -> glow the
 * added tag's outline. `costPercent` -> glow the cost number; additionally glow the VP
 * number too when `vpPerAbsDelta` is set (Gigantic Undertakings glows cost + VP, Mini
 * Mutation glows cost only).
 */
export type MutationEffect =
  /** Placeholder for a mutation whose ongoing card effect hasn't been authored yet. */
  | {kind: 'none'}
  /** Adds one random tag the card doesn't already have (Tag Diversifier / "Diverse"). */
  | {kind: 'addRandomTag'}
  /**
   * Adjusts the card's cost by `percent` of its base cost (negative for a discount,
   * positive for a surcharge), with the absolute change clamped to
   * [minAbsDelta, maxAbsDelta]. When `vpPerAbsDelta` is set, the card also gains
   * `floor(delta / vpPerAbsDelta)` victory points (Gigantic Undertakings).
   */
  | {kind: 'costPercent', percent: number, minAbsDelta: number, maxAbsDelta: number, vpPerAbsDelta?: number}
  /**
   * Doesn't change the mutated card's own cost/tags/VP at all. Instead, the first time
   * it's *played* (not when won), the player receives a fresh, separate copy of the
   * same card discounted by `percent` of its base cost (clamped to
   * [minAbsDelta, maxAbsDelta], same formula as `costPercent`). The granted copy is a
   * plain discounted instance (its discount is baked into `AppliedMutation.bakedCostDelta`,
   * not this effect kind) so playing IT does not spawn yet another copy -- no infinite
   * nesting dolls.
   */
  | {kind: 'nestedCopy', percent: number, minAbsDelta: number, maxAbsDelta: number};
