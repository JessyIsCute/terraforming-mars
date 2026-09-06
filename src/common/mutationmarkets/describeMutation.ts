import {CardRequirementDescriptor} from '../cards/CardRequirementDescriptor';
import {MutationReward} from './MutationDefinition';
import {MutationEffect} from './MutationEffect';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A short, human-readable summary of a mutation's requirement, for the market UI. */
export function describeMutationRequirement(descriptor: CardRequirementDescriptor): string {
  if (descriptor.uniqueTags !== undefined) {
    return `${descriptor.uniqueTags} unique tags`;
  }
  if (descriptor.expensiveCardsPlayed !== undefined) {
    return `${descriptor.expensiveCardsPlayed} cards played costing 25+ M€`;
  }
  if (descriptor.cheapCardsPlayed !== undefined) {
    return `${descriptor.cheapCardsPlayed} cards played costing <7 M€`;
  }
  if (descriptor.cardCostStreak !== undefined) {
    return `${descriptor.cardCostStreak} cards played in a row, each cheaper`;
  }
  if (descriptor.cities !== undefined) {
    return `${descriptor.cities} cities`;
  }
  if (descriptor.greeneries !== undefined) {
    return `${descriptor.greeneries} greeneries`;
  }
  if (descriptor.oceans !== undefined) {
    return `${descriptor.oceans} oceans`;
  }
  if (descriptor.tag !== undefined) {
    return `${descriptor.count ?? 1} ${capitalize(descriptor.tag)} tags`;
  }
  if (descriptor.production !== undefined) {
    return `${descriptor.count ?? 1} ${capitalize(descriptor.production)} production`;
  }
  return 'Unknown requirement';
}

/** A short, human-readable summary of a mutation's one-time auction-win reward. */
export function describeMutationReward(reward: MutationReward): string {
  const parts: Array<string> = [];
  if (reward.tr !== undefined) {
    parts.push(`+${reward.tr} TR`);
  }
  if (reward.megacredits !== undefined) {
    parts.push(`+${reward.megacredits} M€`);
  }
  if (reward.cards !== undefined) {
    parts.push(`+${reward.cards} card${reward.cards > 1 ? 's' : ''}`);
  }
  if (reward.victoryPoints !== undefined) {
    parts.push(`+${reward.victoryPoints} VP`);
  }
  return parts.join(', ');
}

/** A short, human-readable summary of the permanent effect a mutation applies to the card it's won on. */
export function describeMutationEffect(effect: MutationEffect): string {
  switch (effect.kind) {
  case 'none':
    return '';
  case 'addRandomTag':
    return 'Gains a random new tag';
  case 'costPercent': {
    const sign = effect.percent >= 0 ? '+' : '';
    const vp = effect.vpPerAbsDelta !== undefined ? ', gains VP' : '';
    return `Cost ${sign}${effect.percent}%${vp}`;
  }
  case 'nestedCopy':
    return `Playing it grants a ${Math.abs(effect.percent)}% cheaper copy`;
  }
}
