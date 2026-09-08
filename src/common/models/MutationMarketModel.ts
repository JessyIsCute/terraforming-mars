import {CardModel} from './CardModel';
import {Color} from '../Color';
import {MarketSlotContent} from '../mutationmarkets/MarketSlotContent';

export type MutationMarketProjectSlotModel = {
  card: CardModel;
  active: boolean;
  /** Fixed by this slot's position -- see MutationMarkets.minimumBidFor. Only meaningful while `active`. */
  minimumBid: number;
  auction?: {highBid: number, highBidderColor: Color};
  /** Covering mutation(s)/infection(s) whose row is currently physically above the project row. */
  coveringMutationsAbove: ReadonlyArray<MarketSlotContent>;
  /** Covering mutation(s)/infection(s) whose row is currently physically below the project row. */
  coveringMutationsBelow: ReadonlyArray<MarketSlotContent>;
} | undefined;

export type MutationMarketMutationSlotModel = ({
  active: boolean;
  /**
   * Each player's current numeric progress toward this mutation's requirement, mirroring
   * Milestones/Awards' public per-player score display. Omitted for requirement kinds
   * with no natural running count (e.g. boolean-only checks like `chairman`/`party`), and
   * always omitted for an infection slot -- infections have no requirement to track.
   */
  playerProgress?: ReadonlyArray<{color: Color, score: number}>;
} & MarketSlotContent) | undefined;

export type MutationMarketModel = {
  /** Length 6. Index 0 and the last index are inactive-but-visible previews. */
  projectSlots: ReadonlyArray<MutationMarketProjectSlotModel>;
  /** Length 3: position `i` spans projectSlots[2i, 2i+1]. */
  alignedRow: ReadonlyArray<MutationMarketMutationSlotModel>;
  /** Length 4: position 0/3 are half-cards over projectSlots[0]/[last]. */
  offsetRow: ReadonlyArray<MutationMarketMutationSlotModel>;
  offsetRowIsTop: boolean;
};
