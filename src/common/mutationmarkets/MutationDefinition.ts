import {MutationName} from './MutationName';
import {CardRequirementDescriptor} from '../cards/CardRequirementDescriptor';
import {MutationEffect} from './MutationEffect';

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
  /**
   * The permanent effect applied to the won card. Winning an auction gets you the card
   * with this applied -- nothing else; there's no separate one-time payout.
   */
  effect: MutationEffect,
};
