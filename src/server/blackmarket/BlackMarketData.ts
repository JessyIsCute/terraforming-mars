import {IProjectCard} from '../cards/IProjectCard';

export const BLACK_MARKET_ROW_SLOT_COUNT = 4;

/**
 * One slot is one design's "stack": `variantIndex` (0,1,2) is which of the design's 3
 * printings is currently on top -- each printing carries its own price on the card itself
 * (`card.cost`/`card.reserveUnits`; see BlackMarketCardManifest.ts's doc comment). Doing the
 * project reveals the SAME design's next printing underneath (variantIndex + 1) until the
 * stack runs out, at which point a fresh, previously-unseen design (from the same tier) takes
 * this slot's place.
 */
export type BlackMarketSlot = {
  card: IProjectCard;
  designIndex: number;
  variantIndex: number;
} | undefined;

export type BlackMarketRowData = {
  /** Length BLACK_MARKET_ROW_SLOT_COUNT. Always dealt full unless the tier's design pool has been fully exhausted. */
  slots: Array<BlackMarketSlot>;
  /** Indices into BLACK_MARKET_DESIGNS (this row's tier only) not yet shown, shuffled once when the row unlocks. */
  designQueue: Array<number>;
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
  designQueue: Array<number>;
};

/** On-disk shape: a slot's card is reconstructed on load from `BLACK_MARKET_DESIGNS[designIndex].printings[variantIndex]`. */
export type SerializedBlackMarketData = {
  early: SerializedBlackMarketRowData;
  mid: SerializedBlackMarketRowData | undefined;
  late: SerializedBlackMarketRowData | undefined;
};
