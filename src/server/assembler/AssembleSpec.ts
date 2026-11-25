import {Tag} from '../../common/cards/Tag';
import {CardType} from '../../common/cards/CardType';
import {EffectCategory} from '../../common/assembler/EffectCategory';

export type AssemblerComplexity = 'low' | 'mid' | 'high';

/**
 * Constraints for one Assemble -- a "preset". Every field is optional; an empty spec is a fully
 * random card. Used by printed cards like "Assemble a card with at least 1 science tag".
 */
export type AssembleSpec = {
  /** Default: picked at random (more low and mid than high). */
  complexity?: AssemblerComplexity,
  /** The card has all of these tags (and maybe others). */
  tags?: ReadonlyArray<Tag>,
  /** The card has exactly this many tags. */
  tagCount?: number,
  /**
   * The card's printed cost is in this range. A card that would cost less gets extra good parts
   * until it's worth enough, so even a low-complexity card can hit a high cost.
   */
  minCost?: number,
  maxCost?: number,
  /** Added to the cost after pricing, e.g. -10 for "yours costs 10 M€ less". Never below 0. */
  costAdjust?: number,
  /** The card always has a requirement. */
  forceRequirement?: boolean,
  /** The card has at least one part of each of these effect categories (see EffectCategory). */
  categories?: ReadonlyArray<EffectCategory>,
  /** The card is this type. */
  type?: CardType.AUTOMATED | CardType.ACTIVE | CardType.EVENT,
};
