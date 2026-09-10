import {IProjectCard} from '../cards/IProjectCard';
import {BlackMarketPrice} from '../../common/blackmarket/BlackMarketPrice';

export const BLACK_MARKET_SLOT_COUNT = 5;

/**
 * One slot is one design's "stack": `variantIndex` (0,1,2) is which of the design's 3
 * printings is currently on top, and `price` is that printing's resolved price (rolled once,
 * at reveal time, for a `variable` design -- see `resolveBlackMarketPrice`). Buying the
 * card reveals the SAME design's next printing underneath (variantIndex + 1) until the
 * stack runs out, at which point a fresh, previously-unseen design takes this slot's place.
 */
export type BlackMarketSlot = {
  card: IProjectCard;
  designIndex: number;
  variantIndex: number;
  price: BlackMarketPrice;
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

/** On-disk shape: identical to the live shape -- nothing here needs reconstruction beyond the card instance itself. */
export type SerializedBlackMarketData = {
  slots: Array<{designIndex: number, variantIndex: number, price: BlackMarketPrice} | undefined>;
  designQueue: Array<number>;
};
