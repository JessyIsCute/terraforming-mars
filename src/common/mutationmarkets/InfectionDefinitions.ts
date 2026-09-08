import {InfectionName} from './InfectionName';
import {InfectionDefinition} from './InfectionDefinition';
import {Resource} from '../Resource';

/** The Infection card manifest -- Pandemica's action lets the acting player choose one of these to apply. */
export const INFECTION_DEFINITIONS: Record<InfectionName, InfectionDefinition> = {
  [InfectionName.COST_INFLATION]: {
    name: InfectionName.COST_INFLATION,
    prefix: 'Overpriced',
    effect: {kind: 'costIncrease', amount: 4},
  },
  [InfectionName.VALUE_SIPHON]: {
    name: InfectionName.VALUE_SIPHON,
    prefix: 'Siphoned',
    effect: {kind: 'victoryPointPenalty', amount: 1},
  },
  [InfectionName.POWER_DRAIN]: {
    name: InfectionName.POWER_DRAIN,
    prefix: 'Drained',
    effect: {kind: 'resourceDrainOnPlay', resource: Resource.ENERGY, amount: 2},
  },
};
