import {Tag, ALL_TAGS} from '@/common/cards/Tag';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';

/**
 * Client-side re-derivation of Mutations'/Infections' ongoing card effects, for the
 * Mutation/Infection Simulator preview page -- mirrors `MutationEffects`/`InfectionEffects`
 * on the server (src/server/mutationmarkets/{MutationEffects,InfectionEffects}.ts), summing
 * across an arbitrary number of applied mutations/infections exactly like a real card's
 * `ICard.mutations`/`ICard.infections` arrays do (a card can stack several from repeated
 * market wins, and the simulator lets you pick more than one at once to preview that).
 */
export type MutationsPreview = {
  /** From the first selected addRandomTag-kind mutation only, matching ModelUtils.ts's `card.mutations.find(...)`. */
  chosenTag?: Tag,
  highlight: {tag?: boolean, cost?: boolean, vp?: boolean, nested?: boolean},
  victoryPoints: number,
  cost: number,
};

export type InfectionsPreview = {
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

export function previewMutations(mutations: ReadonlyArray<MutationName>, baseCost: number, existingTags: ReadonlyArray<Tag>): MutationsPreview {
  const highlight: MutationsPreview['highlight'] = {};
  let victoryPoints = 0;
  let cost = baseCost;
  let chosenTag: Tag | undefined;

  for (const mutation of mutations) {
    const effect = MUTATION_DEFINITIONS[mutation].effect;
    if (effect.kind === 'addRandomTag') {
      highlight.tag = true;
      // Only the first addRandomTag-kind pick gets a badge -- matches ModelUtils.ts's
      // cardsToModel(), which surfaces card.mutations.find(...)'s single result even
      // when more than one applied mutation could have set chosenTag.
      if (chosenTag === undefined) {
        chosenTag = pickRandomTag(existingTags);
      }
    }
    if (effect.kind === 'costPercent') {
      highlight.cost = true;
      // Each mutation's delta is computed against the ORIGINAL baseCost, then summed --
      // not compounded against a running total -- matching MutationEffects.applyCost.
      cost += costDelta(effect, baseCost);
      if (effect.vpPerAbsDelta !== undefined) {
        highlight.vp = true;
        victoryPoints += Math.floor(Math.abs(costDelta(effect, baseCost)) / effect.vpPerAbsDelta);
      }
    }
    if (effect.kind === 'nestedCopy') {
      highlight.nested = true;
    }
  }

  return {chosenTag, highlight, victoryPoints, cost: Math.max(cost, 0)};
}

export function previewInfections(infections: ReadonlyArray<InfectionName>, baseCost: number): InfectionsPreview {
  const highlight: InfectionsPreview['highlight'] = {};
  let victoryPoints = 0;
  let cost = baseCost;

  for (const infection of infections) {
    const effect = INFECTION_DEFINITIONS[infection].effect;
    if (effect.kind === 'costIncrease') {
      highlight.cost = true;
      cost += effect.amount;
    }
    if (effect.kind === 'victoryPointPenalty') {
      highlight.vp = true;
      victoryPoints -= effect.amount;
    }
  }

  return {highlight, victoryPoints, cost: Math.max(cost, 0)};
}
