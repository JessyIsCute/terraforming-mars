import {InfectionEffect} from './InfectionEffect';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A short, human-readable summary of the permanent effect an infection applies to the card it lands on. */
export function describeInfectionEffect(effect: InfectionEffect): string {
  switch (effect.kind) {
  case 'costIncrease':
    return `Cost +${effect.amount} M€`;
  case 'victoryPointPenalty':
    return `-${effect.amount} VP`;
  case 'resourceDrainOnPlay':
    return `Lose ${effect.amount} ${capitalize(effect.resource)} on play`;
  }
}
