import {CardModel} from '../models/CardModel';

/**
 * Assembler (fan): the card generator page (paths.ASSEMBLER) asks paths.API_ASSEMBLER for cards.
 *
 * Query parameters, all optional:
 *   count        how many cards, 1..MAX_COUNT (default DEFAULT_COUNT)
 *   seed         1..MAX_SEED; the same seed and options give the same cards (default: random)
 *   minComplexity, maxComplexity   complexity range, 1..8 (default: random per card, mostly simple)
 *   complexity   short for minComplexity = maxComplexity
 *   type         automated | active | event
 *   categories   comma-separated EffectCategory list: guaranteed effects
 *   tags         comma-separated Tag list: tags the card must have
 *   tagCount     exact number of tags, 1..4
 *   minCost, maxCost   printed cost range, 0..MAX_COST
 *   costAdjust   added to the cost after pricing, -MAX_COST_ADJUST..MAX_COST_ADJUST
 *   requirement  1: the card always has a requirement
 *   spread       1: rating mode. Most cards get a hidden shift of their printed cost (in
 *                assembled.costAdjust), to check whether votes notice
 */
export const ASSEMBLER_PREVIEW_LIMITS = {
  DEFAULT_COUNT: 6,
  MAX_COUNT: 12,
  MAX_SEED: 999999,
  MAX_COST: 60,
  MAX_COST_ADJUST: 30,
  MAX_TAG_COUNT: 4,
  /** Complexity runs 1..MAX_COMPLEXITY. */
  MAX_COMPLEXITY: 7,
} as const;

export type AssemblerPreviewResponse = {
  /** The seed used; pass it back to get the same cards again. */
  seed: number,
  cards: ReadonlyArray<CardModel>,
  /** How many of the requested cards couldn't be made with these options (they rarely fit on a card). */
  failed?: number,
};

/** Tags the generator page offers (the tags assembled cards are made with). */
export const ASSEMBLER_PREVIEW_TAGS = [
  'building', 'space', 'earth', 'science', 'venus', 'plant', 'power', 'microbe', 'jovian', 'city', 'animal', 'wild',
] as const;
