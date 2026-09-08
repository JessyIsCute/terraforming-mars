import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {Tag} from '../../common/cards/Tag';
import {AppliedInfection} from '../../common/mutationmarkets/AppliedInfection';
import {InfectionName} from '../../common/mutationmarkets/InfectionName';
import {INFECTION_DEFINITIONS} from '../../common/mutationmarkets/InfectionDefinitions';

/**
 * Applies Pandemica's permanent, negative Infection effects -- the negative counterpart
 * to `MutationEffects`. Reads the sanctioned per-instance `ICard.infections` field only --
 * never touches `Card.properties` (the shared, process-wide cache every instance of a
 * card class points to).
 */
export class InfectionEffects {
  private constructor() {}

  /** Builds the record to store on an infected card. No randomized outcome exists for any infection. */
  public static apply(infection: InfectionName): AppliedInfection {
    return {infection};
  }

  public static applyCost(card: ICard, baseCost: number): number {
    if (card.infections === undefined || card.infections.length === 0) {
      return baseCost;
    }
    let cost = baseCost;
    for (const applied of card.infections) {
      const effect = INFECTION_DEFINITIONS[applied.infection].effect;
      if (effect.kind === 'costIncrease') {
        cost += effect.amount;
      }
    }
    return Math.max(cost, 0);
  }

  /** Adds Tag.INFECTED once if the card has any infection -- fixed, not chosen like Tag Diversifier's random tag. */
  public static applyTags(card: ICard, baseTags: ReadonlyArray<Tag>): Array<Tag> {
    if (card.infections === undefined || card.infections.length === 0) {
      return [...baseTags];
    }
    if (baseTags.includes(Tag.INFECTED)) {
      return [...baseTags];
    }
    return [...baseTags, Tag.INFECTED];
  }

  /** The VP penalty an infected card carries, independent of its own printed VP formula. */
  public static victoryPointsBonus(card: ICard): number {
    if (card.infections === undefined || card.infections.length === 0) {
      return 0;
    }
    let bonus = 0;
    for (const applied of card.infections) {
      const effect = INFECTION_DEFINITIONS[applied.infection].effect;
      if (effect.kind === 'victoryPointPenalty') {
        bonus -= effect.amount;
      }
    }
    return bonus;
  }

  /** Every applied infection's display-name prefix, e.g. ["Overpriced"] -- combined with any Mutation prefixes by the caller. */
  public static namePrefixes(infectionNames: ReadonlyArray<InfectionName>): Array<string> {
    return infectionNames.map((i) => INFECTION_DEFINITIONS[i].prefix);
  }

  /**
   * Which parts of an infected card should render with the red infected-glow treatment.
   * Derived purely from each applied infection's `effect.kind` so the client never needs
   * its own copy of this mapping.
   */
  public static highlightsFor(card: ICard): {cost?: boolean, vp?: boolean} | undefined {
    if (card.infections === undefined || card.infections.length === 0) {
      return undefined;
    }
    const highlight: {cost?: boolean, vp?: boolean} = {};
    for (const applied of card.infections) {
      const effect = INFECTION_DEFINITIONS[applied.infection].effect;
      if (effect.kind === 'costIncrease') {
        highlight.cost = true;
      }
      if (effect.kind === 'victoryPointPenalty') {
        highlight.vp = true;
      }
    }
    return highlight;
  }

  /** Called when `card` is played. Applies every `resourceDrainOnPlay` infection currently applied to it. */
  public static applyOnPlayEffects(player: IPlayer, card: ICard): void {
    if (card.infections === undefined) {
      return;
    }
    for (const applied of card.infections) {
      const effect = INFECTION_DEFINITIONS[applied.infection].effect;
      if (effect.kind === 'resourceDrainOnPlay') {
        // Drain at most what the player actually has -- Stock.add's own clamp path
        // logs an "illegal state" warning, which is meant to catch bugs, not model an
        // intentional "drain what's there" effect.
        const amountToLose = Math.min(player.stock[effect.resource], effect.amount);
        if (amountToLose > 0) {
          player.stock.deduct(effect.resource, amountToLose, {log: true});
        }
      }
    }
  }
}
