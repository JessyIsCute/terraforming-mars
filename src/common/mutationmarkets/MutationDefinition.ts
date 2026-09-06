import {MutationName} from './MutationName';
import {CardRequirementDescriptor} from '../cards/CardRequirementDescriptor';
import {MutationEffect} from './MutationEffect';

/**
 * A mutation's one-time payout, granted once when an auction it covers resolves in a
 * qualifying player's favor. Kept intentionally small for Phase 1 (the market skeleton) --
 * evaluating/granting these is Phase 3 work.
 */
export type MutationReward = {
  tr?: number,
  megacredits?: number,
  cards?: number,
  victoryPoints?: number,
};

export type MutationDefinition = {
  name: MutationName,
  /**
   * The word prefixed to a won card's name for display purposes once mutated, e.g.
   * "Diverse" -> "Diverse Sponsors". Display-only: the card's real `name`/`CardName`
   * never changes (that's a stable identifier used for serialization and lookups).
   */
  prefix: string,
  /**
   * Reuses the shared card-requirement shape (same one `CardRequirements.compile()`
   * evaluates for normal cards) so a future bidding-eligibility check needs no new
   * requirement-parsing code.
   */
  requirement: CardRequirementDescriptor,
  reward: MutationReward,
  /** The minimum opening bid on a project card this mutation covers. */
  minimumBid: number,
  /** How many pair-positions this mutation's row shifts by at generation end, while active. */
  steps: 1 | 2,
  /** The permanent effect applied to the won card. */
  effect: MutationEffect,
};
