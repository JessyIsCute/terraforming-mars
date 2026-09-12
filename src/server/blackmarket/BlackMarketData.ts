import {IProjectCard} from '../cards/IProjectCard';

export const BLACK_MARKET_ROW_SLOT_COUNT = 4;

/**
 * One slot holds a single design printing sitting in the market. A card, once dealt, keeps
 * this exact identity (same design/printing) as it rides the conveyor leftward -- it never
 * changes into a different printing in place. It leaves the market only by being bought
 * (`BlackMarket.buy` empties the slot immediately) or by reaching the leftmost position and
 * being discarded at the next generation's end (`BlackMarket.onGenerationEnd`).
 */
export type BlackMarketSlot = {
  card: IProjectCard;
  designIndex: number;
  variantIndex: number;
} | undefined;

export type BlackMarketRowData = {
  /** Length BLACK_MARKET_ROW_SLOT_COUNT, left-to-right. `undefined` means empty (bought, or the queue ran dry). */
  slots: Array<BlackMarketSlot>;
  /**
   * Every not-yet-dealt printing across every compatible design in this row's tier -- one
   * entry per printing (so a design with 4 printings contributes 4 entries), shuffled once
   * when the row unlocks. `BlackMarket.onGenerationEnd` pops the next one to refill the
   * rightmost slot each time the row shifts left.
   */
  printingQueue: Array<{designIndex: number, variantIndex: number}>;
};

/**
 * Live, in-memory market state: 3 era rows. `early` is always present from game start; `mid`/
 * `late` stay `undefined` until the game reaches their unlock generation (see
 * BLACK_MARKET_TIER_UNLOCK_GENERATION in BlackMarketCardManifest.ts), at which point
 * `BlackMarket.onGenerationStart` deals them in for the first time.
 */
export type BlackMarketData = {
  early: BlackMarketRowData;
  mid: BlackMarketRowData | undefined;
  late: BlackMarketRowData | undefined;
};

export type SerializedBlackMarketRowData = {
  slots: Array<{designIndex: number, variantIndex: number} | undefined>;
  printingQueue: Array<{designIndex: number, variantIndex: number}>;
};

/** On-disk shape: a slot's card is reconstructed on load from `BLACK_MARKET_DESIGNS[designIndex].printings[variantIndex]`. */
export type SerializedBlackMarketData = {
  early: SerializedBlackMarketRowData;
  mid: SerializedBlackMarketRowData | undefined;
  late: SerializedBlackMarketRowData | undefined;
};
