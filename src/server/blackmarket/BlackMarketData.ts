import {IProjectCard} from '../cards/IProjectCard';

export const BLACK_MARKET_SLOT_COUNT = 5;

/**
 * One slot is one design's "stack": `variantIndex` (0,1,2) is which of the design's 3
 * printings is currently on top -- each printing carries its own price on the card itself
 * (`card.cost`/`card.reserveUnits`; see BlackMarketCardManifest.ts's doc comment). Doing the
 * project reveals the SAME design's next printing underneath (variantIndex + 1) until the
 * stack runs out, at which point a fresh, previously-unseen design takes this slot's place.
 */
export type BlackMarketSlot = {
  card: IProjectCard;
  designIndex: number;
  variantIndex: number;
} | undefined;

/**
 * Live, in-memory market state (project slots hold real card instances). See
 * `SerializedBlackMarketData` for the on-disk shape.
 */
export type BlackMarketData = {
  /** Length 5. Always dealt full unless every design's stack has been fully exhausted. */
  slots: Array<BlackMarketSlot>;
  /** Indices into BLACK_MARKET_DESIGNS not yet shown in the market, shuffled once at game start. */
  designQueue: Array<number>;
};

/** On-disk shape: a slot's card is reconstructed on load from `BLACK_MARKET_DESIGNS[designIndex].printings[variantIndex]`. */
export type SerializedBlackMarketData = {
  slots: Array<{designIndex: number, variantIndex: number} | undefined>;
  designQueue: Array<number>;
};
