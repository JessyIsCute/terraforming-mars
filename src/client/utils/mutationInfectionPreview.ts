import {Tag, ALL_TAGS} from '@/common/cards/Tag';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';

/**
 * Client-side re-derivation of a single Mutation's ongoing card effect, for the
 * Mutation/Infection Simulator preview page -- mirrors `MutationEffects` on the server
 * (src/server/mutationmarkets/MutationEffects.ts), but simplified to exactly one applied
 * mutation at a time (the server's version sums across `ICard.mutations`, an array, since
 * a real card can stack several from repeated market wins; the simulator only ever
 * previews one pick at a time, so there's nothing to sum).
 */
export type MutationPreview = {
  chosenTag?: Tag,
  highlight: {tag?: boolean, cost?: boolean, vp?: boolean, nested?: boolean},
  victoryPoints: number,
  cost: number,
};

export type InfectionPreview = {
  highlight: {cost?: boolean, vp?: boolean},
  victoryPoints: number,
  cost: number,
};

/** Same clamp formula as MutationEffects' private `costDelta`. */
function costDelta(effect: {percent: number, minAbsDelta: number, maxAbsDelta: number}, baseCost: number): number {
  const raw = Math.round(baseCost * effect.percent / 100);
  const sign = raw !== 0 ? Math.sign(raw) : Math.sign(effect.percent);
  const abs = Math.min(Math.max(Math.abs(raw), effect.minAbsDelta), effect.maxAbsDelta);
  return sign * abs;
}

/**
 * Mirrors `MutationEffects.chooseRandomTag`, minus the seeded `Random` dependency --
 * this is a preview, not real game state, so plain `Math.random()` is fine.
 */
export function pickRandomTag(existingTags: ReadonlyArray<Tag>): Tag {
  const existing = new Set(existingTags);
  const candidates = ALL_TAGS.filter((tag) => tag !== Tag.WILD && tag !== Tag.EVENT && tag !== Tag.INFECTED && !existing.has(tag));
  if (candidates.length === 0) {
    return ALL_TAGS.filter((tag) => tag !== Tag.WILD && tag !== Tag.INFECTED)[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function previewMutation(mutation: MutationName, baseCost: number, existingTags: ReadonlyArray<Tag>): MutationPreview {
  const effect = MUTATION_DEFINITIONS[mutation].effect;
  const highlight: MutationPreview['highlight'] = {};
  let victoryPoints = 0;
  let cost = baseCost;
  let chosenTag: Tag | undefined;

  if (effect.kind === 'addRandomTag') {
    highlight.tag = true;
    chosenTag = pickRandomTag(existingTags);
  }
  if (effect.kind === 'costPercent') {
    highlight.cost = true;
    cost = Math.max(baseCost + costDelta(effect, baseCost), 0);
    if (effect.vpPerAbsDelta !== undefined) {
      highlight.vp = true;
      victoryPoints = Math.floor(Math.abs(costDelta(effect, baseCost)) / effect.vpPerAbsDelta);
    }
  }
  if (effect.kind === 'nestedCopy') {
    highlight.nested = true;
  }

  return {chosenTag, highlight, victoryPoints, cost};
}

export function previewInfection(infection: InfectionName, baseCost: number): InfectionPreview {
  const effect = INFECTION_DEFINITIONS[infection].effect;
  const highlight: InfectionPreview['highlight'] = {};
  let victoryPoints = 0;
  let cost = baseCost;

  if (effect.kind === 'costIncrease') {
    highlight.cost = true;
    cost = Math.max(baseCost + effect.amount, 0);
  }
  if (effect.kind === 'victoryPointPenalty') {
    highlight.vp = true;
    victoryPoints = -effect.amount;
  }

  return {highlight, victoryPoints, cost};
}
