import {IProjectCard} from '../cards/IProjectCard';

export const BLACK_MARKET_ROW_SLOT_COUNT = 4;

/**
 * One slot tracks one design's printing: `variantIndex` is which of the design's printings
 * (4/3/2 depending on tier -- see BlackMarketCardManifest.ts) it currently holds. Doing the
 * project no longer reveals a replacement in the same slot -- the slot just goes empty (see
 * `BlackMarketRowData.sold`) until the whole row advances at the next generation's end
 * (`BlackMarket.onGenerationEnd`), at which point every slot -- bought or not -- moves on to
 * the same design's next printing, or a fresh design once its printings run out.
 */
export type BlackMarketSlot = {
  card: IProjectCard;
  designIndex: number;
  variantIndex: number;
} | undefined;

export type BlackMarketRowData = {
  /**
   * Length BLACK_MARKET_ROW_SLOT_COUNT. Keeps tracking a bought slot's design/printing
   * internally (so `onGenerationEnd` knows what to advance from) even while `sold[i]` hides
   * it from the market for the rest of the generation. `undefined` only once that slot's
   * design pool is permanently exhausted.
   */
  slots: Array<BlackMarketSlot>;
  /** `sold[i]` is true once `slots[i]` has been bought this generation -- hidden from display/purchase until the next `onGenerationEnd` sweep resets it. */
  sold: Array<boolean>;
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
  sold: Array<boolean>;
  designQueue: Array<number>;
};

/** On-disk shape: a slot's card is reconstructed on load from `BLACK_MARKET_DESIGNS[designIndex].printings[variantIndex]`. */
export type SerializedBlackMarketData = {
  early: SerializedBlackMarketRowData;
  mid: SerializedBlackMarketRowData | undefined;
  late: SerializedBlackMarketRowData | undefined;
};
