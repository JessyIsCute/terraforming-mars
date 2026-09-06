import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {Tag} from '../../common/cards/Tag';
import {ALL_TAGS} from '../../common/cards/Tag';
import {AppliedMutation} from '../../common/mutationmarkets/AppliedMutation';
import {MutationName} from '../../common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {MutationEffect} from '../../common/mutationmarkets/MutationEffect';
import {Random} from '../../common/utils/Random';

/**
 * Applies MutationMarkets' permanent, ongoing card effects. Reads the sanctioned
 * per-instance `ICard.mutations` field only -- never touches `Card.properties` (the
 * shared, process-wide cache every instance of a card class points to).
 */
export class MutationEffects {
  private constructor() {}

  /** Builds the record to store on a won card, choosing a random outcome where the mutation calls for one. */
  public static apply(card: ICard, mutation: MutationName, rng: Random): AppliedMutation {
    const effect = MUTATION_DEFINITIONS[mutation].effect;
    if (effect.kind === 'addRandomTag') {
      return {mutation, chosenTag: MutationEffects.chooseRandomTag(card, rng)};
    }
    return {mutation};
  }

  private static chooseRandomTag(card: ICard, rng: Random): Tag {
    const existing = new Set(card.tags);
    const candidates = ALL_TAGS.filter((tag) => tag !== Tag.WILD && tag !== Tag.EVENT && !existing.has(tag));
    if (candidates.length === 0) {
      // Every tag already present (essentially impossible) -- fall back to any non-wild tag.
      return ALL_TAGS.filter((tag) => tag !== Tag.WILD)[0];
    }
    return candidates[rng.nextInt(candidates.length)];
  }

  public static applyTags(card: ICard, baseTags: ReadonlyArray<Tag>): Array<Tag> {
    if (card.mutations === undefined || card.mutations.length === 0) {
      return [...baseTags];
    }
    const tags = [...baseTags];
    for (const applied of card.mutations) {
      if (applied.chosenTag !== undefined && !tags.includes(applied.chosenTag)) {
        tags.push(applied.chosenTag);
      }
    }
    return tags;
  }

  public static applyCost(card: ICard, baseCost: number): number {
    if (card.mutations === undefined || card.mutations.length === 0) {
      return baseCost;
    }
    let cost = baseCost;
    for (const applied of card.mutations) {
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind === 'costPercent') {
        cost += MutationEffects.costDelta(effect, baseCost);
      }
      // Nested Mutation: a flat adjustment already computed and baked into this specific
      // spawned-copy instance, independent of `mutation`'s own effect kind.
      if (applied.bakedCostDelta !== undefined) {
        cost += applied.bakedCostDelta;
      }
    }
    return Math.max(cost, 0);
  }

  /** The cost delta a fresh copy spawned by Nested Mutation's `nestedCopy` effect should be given (see `AppliedMutation.bakedCostDelta`). */
  public static nestedCopyDelta(baseCost: number, effect: Extract<MutationEffect, {kind: 'nestedCopy'}>): number {
    return MutationEffects.costDelta(effect, baseCost);
  }

  /** The extra victory points a mutated card is worth, independent of its own printed VP formula. */
  public static victoryPointsBonus(card: ICard, _player: IPlayer): number {
    if (card.mutations === undefined || card.mutations.length === 0 || card.baseCost === undefined) {
      return 0;
    }
    let bonus = 0;
    for (const applied of card.mutations) {
      bonus += applied.oneTimeVictoryPointsGranted ?? 0;
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind === 'costPercent' && effect.vpPerAbsDelta !== undefined) {
        const delta = Math.abs(MutationEffects.costDelta(effect, card.baseCost));
        bonus += Math.floor(delta / effect.vpPerAbsDelta);
      }
    }
    return bonus;
  }

  /**
   * Which parts of a mutated card should render with the green mutated-glow treatment.
   * Derived purely from each applied mutation's `effect.kind` (see the doc comment on
   * `MutationEffect`) so the client never needs its own copy of this mapping.
   */
  public static highlightsFor(card: ICard): {tag?: boolean, cost?: boolean, vp?: boolean, nested?: boolean} | undefined {
    if (card.mutations === undefined || card.mutations.length === 0) {
      return undefined;
    }
    const highlight: {tag?: boolean, cost?: boolean, vp?: boolean, nested?: boolean} = {};
    for (const applied of card.mutations) {
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind === 'addRandomTag') {
        highlight.tag = true;
      }
      if (effect.kind === 'costPercent') {
        highlight.cost = true;
        if (effect.vpPerAbsDelta !== undefined) {
          highlight.vp = true;
        }
      }
      if (effect.kind === 'nestedCopy') {
        highlight.nested = true;
      }
      if (applied.bakedCostDelta !== undefined) {
        highlight.cost = true;
      }
      if (applied.oneTimeVictoryPointsGranted !== undefined) {
        highlight.vp = true;
      }
    }
    return highlight;
  }

  private static costDelta(effect: {percent: number, minAbsDelta: number, maxAbsDelta: number}, baseCost: number): number {
    const raw = Math.round(baseCost * effect.percent / 100);
    const sign = raw !== 0 ? Math.sign(raw) : Math.sign(effect.percent);
    const abs = Math.min(Math.max(Math.abs(raw), effect.minAbsDelta), effect.maxAbsDelta);
    return sign * abs;
  }
}
