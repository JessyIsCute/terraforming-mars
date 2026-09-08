import {InfectionName} from './InfectionName';

/**
 * An infection permanently applied to a card instance. Stored on the card itself
 * (`ICard.infections`) so it round-trips through normal card serialization. No
 * randomized outcome exists for any infection, unlike `AppliedMutation.chosenTag`.
 */
export type AppliedInfection = {
  infection: InfectionName,
};
