import {MutationName} from './MutationName';
import {Tag} from '../cards/Tag';

/**
 * A mutation permanently applied to a won project card. Stored on the card instance
 * itself (`ICard.mutations`) so it round-trips through normal card serialization.
 */
export type AppliedMutation = {
  mutation: MutationName,
  /** Only set for mutations with a chosen tag (Tag Diversifier's random pick, or a fixed addSpecificTag). */
  chosenTag?: Tag,
};
