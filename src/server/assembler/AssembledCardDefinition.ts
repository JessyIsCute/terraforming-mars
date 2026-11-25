import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {CardRequirementDescriptor} from '../../common/cards/CardRequirementDescriptor';
import {CardDiscount} from '../../common/cards/Types';
import {Units} from '../../common/Units';
import {Behavior} from '../behavior/Behavior';
import {AssemblerComplexity} from './AssembleSpec';

export type {AssemblerComplexity} from './AssembleSpec';

/** "When you play a card with `tag`, gain `gain`." */
export type AssembledTrigger = {
  tag: Tag,
  gain: Partial<Units>,
};

/** One line of the card's price, for the tooltip and for tests. */
export type AssembledValueLine = {
  text: string,
  value: number,
};

/**
 * Everything needed to rebuild an assembled card. Saved with the game (SerializedGame.assembledCards)
 * because these cards exist nowhere else: hands and decks only store card names.
 * The card's picture (renderData) is not stored; it's rebuilt from these fields.
 */
export interface AssembledCardDefinition {
  /** Unique across the whole server: `Assembled <gameId>-<n>`. */
  name: string;
  /** What players see on the card, e.g. "Modular Greenhouse". */
  title: string;
  complexity: AssemblerComplexity;
  type: CardType.AUTOMATED | CardType.ACTIVE | CardType.EVENT;
  cost: number;
  tags: Array<Tag>;
  requirements: Array<CardRequirementDescriptor>;
  victoryPoints?: number;
  behavior?: Behavior;
  action?: Behavior;
  cardDiscount?: Array<CardDiscount>;
  trigger?: AssembledTrigger;
  /** Text for the card's on-play part. */
  description: string;
  /** Effect / action texts, in the order they're drawn. */
  effectTexts: Array<string>;
  value: number;
  breakdown: Array<AssembledValueLine>;
  /**
   * Set when a preset changed the printed cost after pricing (e.g. -10, "yours costs 10 M€ less").
   * `cost` already includes it; without it, cost = round(value - 3).
   */
  costAdjust?: number;
}
