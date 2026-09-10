import {InfectionName} from './InfectionName';
import {InfectionDefinition} from './InfectionDefinition';
import {Resource} from '../Resource';

/** The Infection card manifest -- Blacklab Cartel's action lets the acting player choose one of these to apply. */
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
    effect: {kind: 'resourceCostOnPlay', resource: Resource.ENERGY, amount: 2},
  },
  [InfectionName.PLANT_ROT]: {
    name: InfectionName.PLANT_ROT,
    prefix: 'Rotted',
    effect: {kind: 'resourceCostOnPlay', resource: Resource.PLANTS, amount: 2},
  },
  [InfectionName.STEEL_RUST]: {
    name: InfectionName.STEEL_RUST,
    prefix: 'Rusted',
    effect: {kind: 'resourceCostOnPlay', resource: Resource.STEEL, amount: 2},
  },
  [InfectionName.TITANIUM_CORROSION]: {
    name: InfectionName.TITANIUM_CORROSION,
    prefix: 'Corroded',
    // Titanium is worth more per unit than steel/plants/energy, so the mandatory cost is smaller.
    effect: {kind: 'resourceCostOnPlay', resource: Resource.TITANIUM, amount: 1},
  },
  [InfectionName.HEAT_LOSS]: {
    name: InfectionName.HEAT_LOSS,
    prefix: 'Chilled',
    effect: {kind: 'resourceCostOnPlay', resource: Resource.HEAT, amount: 2},
  },
};
