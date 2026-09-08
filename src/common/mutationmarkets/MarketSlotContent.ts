import {MutationName} from './MutationName';
import {InfectionName} from './InfectionName';

/**
 * What a single market mutation-row slot holds -- either a Mutation or an Infection,
 * drawn from one shared shuffled pool. Shared between server (`MutationSlot`, the draw/
 * discard piles) and client (`MutationMarketMutationSlotModel`, the project slots'
 * covering-content preview arrays) so both sides agree on the same discriminant.
 */
export type MarketSlotContent =
  | {kind: 'mutation', mutation: MutationName}
  | {kind: 'infection', infection: InfectionName};
