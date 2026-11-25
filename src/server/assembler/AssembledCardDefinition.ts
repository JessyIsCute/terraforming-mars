import {Resource} from '../../common/Resource';
import {CardResource} from '../../common/CardResource';
import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {CardRequirementDescriptor} from '../../common/cards/CardRequirementDescriptor';
import {CardDiscount} from '../../common/cards/Types';
import {Units} from '../../common/Units';
import {Behavior} from '../behavior/Behavior';
import {EffectCategory} from '../../common/assembler/EffectCategory';

/** "When you play a card with `tag`, gain `gain`" (or draw cards, or add a resource to this card). */
export type AssembledTrigger = {
  tag: Tag,
  gain: Partial<Units>,
  drawCard?: number,
  /** Add this many of the card's own resource (see `cardResource`) to it. */
  addResource?: number,
};

/** One line of the card's price, for the tooltip and for tests. */
export type AssembledValueLine = {
  text: string,
  value: number,
  /** The part's effect category. Not set on tag/requirement lines, or on cards saved before categories existed. */
  category?: EffectCategory,
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
  /**
   * 1 per benefit, effect or action, drawback and requirement, plus 1 per tag after the first.
   * Games saved before this was a number say low / mid / high: see upgradeAssembledCard.
   */
  complexity: number;
  type: CardType.AUTOMATED | CardType.ACTIVE | CardType.EVENT;
  cost: number;
  tags: Array<Tag>;
  requirements: Array<CardRequirementDescriptor>;
  victoryPoints?: number;
  behavior?: Behavior;
  action?: Behavior;
  cardDiscount?: Array<CardDiscount>;
  trigger?: AssembledTrigger;
  /** The card collects this resource (animals, microbes, floaters), worth 1 VP per `vpPer`. */
  cardResource?: {type: CardResource, vpPer?: number};
  /** On play: steal up to `count` of a standard resource from another player. */
  steal?: {resource: Resource, count: number};
  /** On play: discard this many cards from your hand. */
  discard?: number;
  /** On play: every opponent discards this many cards from their hand. */
  opponentsDiscard?: number;
  /** On play: one opponent you choose discards this many cards (they pick which). */
  targetDiscard?: number;
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
