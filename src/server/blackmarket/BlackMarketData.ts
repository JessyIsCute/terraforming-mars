import {IProjectCard} from '../cards/IProjectCard';
import {CardName} from '../../common/cards/CardName';

export const BLACK_MARKET_SLOT_COUNT = 5;

/**
 * Live, in-memory market state (slots hold real card instances). See
 * `SerializedBlackMarketData` for the on-disk shape.
 */
export type BlackMarketData = {
  /** Length 5. Always dealt full unless `drawPile` has been fully exhausted. */
  slots: Array<IProjectCard | undefined>;
  /** Remaining, not-yet-dealt printings, shuffled once at game start. */
  drawPile: Array<CardName>;
};

/** On-disk shape: slots hold only the card's name, reconstructed on load. */
export type SerializedBlackMarketData = {
  slots: Array<CardName | undefined>;
  drawPile: Array<CardName>;
};
