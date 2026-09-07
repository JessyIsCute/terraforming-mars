import {MutationName} from './MutationName';
import {Tag} from '../cards/Tag';

/**
 * A mutation permanently applied to a won project card. Stored on the card instance
 * itself (`ICard.mutations`) so it round-trips through normal card serialization.
 */
export type AppliedMutation = {
  mutation: MutationName,
  /** Only set for mutations with a randomized outcome (Tag Diversifier's chosen tag). */
  chosenTag?: Tag,
  /**
   * A flat cost adjustment already computed and baked into THIS specific card instance,
   * independent of `mutation`'s own effect kind. Used only for a copy spawned by Nested
   * Mutation's `nestedCopy` effect: its presence is also the signal that this instance is
   * itself a spawned copy, so it won't spawn a further copy when played (no infinite
   * nesting dolls).
   */
  bakedCostDelta?: number,
};
