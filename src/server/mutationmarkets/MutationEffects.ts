import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {Tag} from '../../common/cards/Tag';
import {ALL_TAGS} from '../../common/cards/Tag';
import {TAG_REQUIRES_EXPANSION} from '../../common/cards/TagExpansions';
import {Expansion} from '../../common/cards/GameModule';
import {CardType} from '../../common/cards/CardType';
import {AppliedMutation} from '../../common/mutationmarkets/AppliedMutation';
import {MutationName} from '../../common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {Random} from '../../common/utils/Random';

/**
 * Applies MutationMarkets' permanent, ongoing card effects. Reads the sanctioned
 * per-instance `ICard.mutations` field only -- never touches `Card.properties` (the
 * shared, process-wide cache every instance of a card class points to).
 */
export class MutationEffects {
  private constructor() {}

  /** Builds the record to store on a won card, choosing a random outcome where the mutation calls for one. */
  public static apply(card: ICard, mutation: MutationName, rng: Random, expansions: Record<Expansion, boolean>): AppliedMutation {
    const effect = MUTATION_DEFINITIONS[mutation].effect;
    if (effect.kind === 'addRandomTag') {
      return {mutation, chosenTag: MutationEffects.chooseRandomTag(card, rng, expansions)};
    }
    if (effect.kind === 'addSpecificTag') {
      return {mutation, chosenTag: effect.tag};
    }
    return {mutation};
  }

  private static tagAvailable(tag: Tag, expansions: Record<Expansion, boolean>): boolean {
    const requiredExpansion = TAG_REQUIRES_EXPANSION[tag];
    return requiredExpansion === undefined || expansions[requiredExpansion] === true;
  }

  private static chooseRandomTag(card: ICard, rng: Random, expansions: Record<Expansion, boolean>): Tag {
    const existing = new Set(card.tags);
    // Tag.INFECTED is reserved for the Infection mechanic -- never a Tag Diversifier
    // outcome. Tags whose theme belongs to a disabled expansion (Moon, Venus, Mars/Clone
    // from Pathfinders, Crime from Underworld) are excluded too -- no point handing out a
    // tag whose cards/mechanics aren't even in this game's pool.
    const candidates = ALL_TAGS.filter((tag) =>
      tag !== Tag.WILD && tag !== Tag.EVENT && tag !== Tag.INFECTED &&
      !existing.has(tag) && MutationEffects.tagAvailable(tag, expansions));
    if (candidates.length === 0) {
      // Every available tag already present (essentially impossible) -- fall back to any
      // non-wild, non-infected, expansion-available tag.
      return ALL_TAGS.filter((tag) => tag !== Tag.WILD && tag !== Tag.INFECTED && MutationEffects.tagAvailable(tag, expansions))[0];
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
    }
    return Math.max(cost, 0);
  }

  /** The extra victory points a mutated card is worth, independent of its own printed VP formula. */
  public static victoryPointsBonus(card: ICard, _player: IPlayer): number {
    if (card.mutations === undefined || card.mutations.length === 0 || card.baseCost === undefined) {
      return 0;
    }
    let bonus = 0;
    for (const applied of card.mutations) {
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind === 'costPercent' && effect.vpPerAbsDelta !== undefined) {
        const delta = Math.abs(MutationEffects.costDelta(effect, card.baseCost));
        bonus += Math.floor(delta / effect.vpPerAbsDelta);
      }
    }
    return bonus;
  }

  /** Every applied mutation's display-name prefix, e.g. ["Gigantic"] -- combined with any Infection prefixes by the caller (see `combinedDisplayName` in ModelUtils.ts/MutationMarketModel.ts). */
  public static namePrefixes(mutationNames: ReadonlyArray<MutationName>): Array<string> {
    return mutationNames.map((m) => MUTATION_DEFINITIONS[m].prefix);
  }

  /**
   * Flips Automated <-> Event for a `convertType`-mutated card. Active (or any other
   * printed type) passes through unchanged -- flipping an Active card to Event would
   * silently drop its repeatable action, so `convertType`'s effect just doesn't apply to
   * the type there (see `onPlayRebate` for the compensating M€ rebate that fires instead).
   */
  public static applyType(card: ICard, baseType: CardType): CardType {
    if (card.mutations === undefined || card.mutations.length === 0) {
      return baseType;
    }
    const hasConvertType = card.mutations.some((applied) => MUTATION_DEFINITIONS[applied.mutation].effect.kind === 'convertType');
    if (!hasConvertType) {
      return baseType;
    }
    if (baseType === CardType.AUTOMATED) {
      return CardType.EVENT;
    }
    if (baseType === CardType.EVENT) {
      return CardType.AUTOMATED;
    }
    return baseType;
  }

  /**
   * A flat M€ rebate for when a mutation's effect can't apply to the card it landed on
   * (currently: `convertType` on an Active card). Reuses the same clamp formula as a
   * cost discount so the amount stays proportionate to the card without a separate
   * balance knob. General-purpose: any future mutation with a similarly ungrantable case
   * can call this too.
   */
  public static rebateAmount(baseCost: number): number {
    return MutationEffects.costDelta({percent: 30, minAbsDelta: 3, maxAbsDelta: 12}, baseCost);
  }

  /**
   * Which parts of a mutated card should render with the green mutated-glow treatment.
   * Derived purely from each applied mutation's `effect.kind` (see the doc comment on
   * `MutationEffect`) so the client never needs its own copy of this mapping.
   */
  public static highlightsFor(card: ICard): {tag?: boolean, cost?: boolean, vp?: boolean} | undefined {
    if (card.mutations === undefined || card.mutations.length === 0) {
      return undefined;
    }
    const highlight: {tag?: boolean, cost?: boolean, vp?: boolean} = {};
    for (const applied of card.mutations) {
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind === 'addRandomTag' || effect.kind === 'addSpecificTag') {
        highlight.tag = true;
      }
      if (effect.kind === 'costPercent') {
        highlight.cost = true;
        if (effect.vpPerAbsDelta !== undefined) {
          highlight.vp = true;
        }
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
