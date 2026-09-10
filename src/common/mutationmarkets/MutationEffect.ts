import {Resource} from '../Resource';
import {Tag} from '../cards/Tag';

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
   * Adds a specific, fixed tag -- for a mutation whose own win requirement is already
   * tied to one tag family (e.g. Science Patron requires Science tags, so it grants one),
   * rather than picking randomly like Tag Diversifier.
   */
  | {kind: 'addSpecificTag', tag: Tag}
  /**
   * Adjusts the card's cost by `percent` of its base cost (negative for a discount,
   * positive for a surcharge), with the absolute change clamped to
   * [minAbsDelta, maxAbsDelta]. When `vpPerAbsDelta` is set, the card also gains
   * `floor(delta / vpPerAbsDelta)` victory points (Gigantic Undertakings).
   */
  | {kind: 'costPercent', percent: number, minAbsDelta: number, maxAbsDelta: number, vpPerAbsDelta?: number}
  /** The first time the won card is played, the owner gains a flat amount of `resource`. */
  | {kind: 'grantResourceOnPlay', resource: Resource, amount: number}
  /** The first time the won card is played, the owner's `resource` production goes up by `amount`. */
  | {kind: 'grantProductionOnPlay', resource: Resource, amount: number}
  /**
   * Flips the won card between Automated and Event (whichever it printed as). Doesn't
   * cause it to be discarded -- Event cards stay in the tableau exactly like Automated
   * ones in this engine. If the won card is actually Active (so flipping it to Event
   * would silently drop its repeatable action), the flip doesn't happen; instead, the
   * first time it's played, the owner gets a flat M€ rebate instead (the same "can't
   * apply here, so pay a rebate" fallback any future mutation can reuse via
   * `MutationEffects.rebateAmount`).
   */
  | {kind: 'convertType'};
