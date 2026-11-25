import {Tag} from '../../common/cards/Tag';

/**
 * The Assembler value table: what each part of a generated card is worth, in M€.
 * A card's cost is `round(value - BUY_COST)`. See docs/assembler/value-table.md for where every
 * number comes from.
 */
export const BUY_COST = 3;

export const STOCK_VALUE = {
  megacredits: 1,
  steel: 2,
  titanium: 3,
  plants: 2.3,
  heat: 1.2,
  energy: 1.2,
} as const;

/**
 * M€, steel and titanium production come from the fit to official cards
 * (src/server/tools/assembler_fit.ts, docs/assembler/fit-results.md). Energy stays at 6: the fit
 * splits energy production + power tag differently (4.2 + 3.0), but their total is the same.
 */
export const PRODUCTION_VALUE = {
  megacredits: 3.3,
  steel: 5.1,
  titanium: 8.5,
  plants: 6,
  energy: 6,
  heat: 4.5,
} as const;

export type StandardResource = keyof typeof STOCK_VALUE;

/** Fitted to official cards: TR 7.0 (10 cards), VP 3.3 (42 cards). TR is about 1 VP + 1 M€ production. */
export const TR_VALUE = 7;
export const VP_VALUE = 3.3;
export const DRAW_CARD_VALUE = 3;
export const GLOBAL_STEP_VALUE = {temperature: 8.5, oxygen: 8.5, venus: 9} as const;
export const OCEAN_VALUE = 11;
export const GREENERY_VALUE = 14;
/** Fitted to official cards (11 cards). */
export const CITY_VALUE = 8.8;

/**
 * Value of having the tag: base 0.5 + synergy with the official card pool. Paying with steel or
 * titanium is not priced on top: steel and titanium are worth 2 and 3 M€ only because building and
 * space cards accept them, so charging the card again would count that twice (official cards don't).
 */
export const TAG_VALUE: Partial<Record<Tag, number>> = {
  [Tag.SCIENCE]: 3.7,
  [Tag.JOVIAN]: 4.2,
  [Tag.VENUS]: 3.6,
  [Tag.EARTH]: 3.4,
  [Tag.SPACE]: 2,
  [Tag.BUILDING]: 1.5,
  [Tag.PLANT]: 2.1,
  [Tag.MICROBE]: 1.9,
  [Tag.ANIMAL]: 1.3,
  [Tag.POWER]: 1.2,
  [Tag.CITY]: 0.9,
  [Tag.WILD]: 6,
};

/** Every tag after the most valuable one counts this much. */
export const EXTRA_TAG_FACTOR = 0.75;
/** An event's tags leave play once it resolves: they're worth this fraction, plus the event tag. */
export const EVENT_TAG_FACTOR = 0.25;
/** Fitted to official cards (18 events): being an event is worth more than the tag alone. */
export const EVENT_TAG_VALUE = 2;

/** Share of project cards with each tag (official pool). Used for tag discounts and triggers. */
export const TAG_SHARE: Partial<Record<Tag, number>> = {
  [Tag.BUILDING]: 0.31,
  [Tag.SPACE]: 0.26,
  [Tag.EARTH]: 0.16,
  [Tag.SCIENCE]: 0.15,
  [Tag.VENUS]: 0.11,
  [Tag.PLANT]: 0.11,
  [Tag.POWER]: 0.11,
  [Tag.MICROBE]: 0.09,
  [Tag.JOVIAN]: 0.07,
  [Tag.CITY]: 0.07,
  [Tag.ANIMAL]: 0.04,
};

/** How often an effect pays off over the rest of the game. */
export const ACTION_USES = 4;
export const CONVERSION_ACTION_USES = 2;
export const CARDS_PLAYED_AFTER = 8;
/** You build around a tag you get a bonus for. */
export const FOCUS_FACTOR = 2;
export const STANDARD_PROJECTS_AFTER = 2.3;

/** Requirements. */
export const GLOBAL_MIN_REQUIREMENT = -6;
export const GLOBAL_MAX_REQUIREMENT = -2.5;
export const TAG_REQUIREMENT_EXPONENT = 1.5;

/** Attacks are worth a little to the attacker. */
export const REMOVE_PLANT_VALUE = 0.3;
/** Lowering another player's production: this share of what one step is worth (to them). */
export const DECREASE_ANY_FACTOR = 0.4;
/** Stealing: you gain it if someone has it, and they lose it. Times the resource's stock value. */
export const STEAL_FACTOR = 1;
/** Discarding a card from your hand (you pick your worst). */
export const DISCARD_VALUE = 2;
/** Every opponent discards a card. */
export const OPPONENT_DISCARD_VALUE = 1.5;

/** Mid and high cards: the chance of one big benefit paired with one big drawback. */
export const BOLD_CHANCE = 0.3;

export const MIN_COST = 1;
export const MAX_COST = 40;
