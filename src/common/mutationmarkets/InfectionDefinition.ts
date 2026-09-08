import {InfectionName} from './InfectionName';
import {InfectionEffect} from './InfectionEffect';

export type InfectionDefinition = {
  name: InfectionName,
  /**
   * The word prefixed to an infected card's name for display purposes, e.g. "Overpriced"
   * -> "Overpriced Sponsors". Same convention as `MutationDefinition.prefix`.
   */
  prefix: string,
  /** The permanent effect applied to the infected card. */
  effect: InfectionEffect,
};
