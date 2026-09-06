import {CardModel} from './CardModel';
import {Color} from '../Color';
import {MutationName} from '../mutationmarkets/MutationName';

export type MutationMarketProjectSlotModel = {
  card: CardModel;
  active: boolean;
  auction?: {highBid: number, highBidderColor: Color};
} | undefined;

export type MutationMarketMutationSlotModel = {
  mutation: MutationName;
  active: boolean;
  minimumBid: number;
  /**
   * Each player's current numeric progress toward this mutation's requirement, mirroring
   * Milestones/Awards' public per-player score display. Omitted for requirement kinds
   * with no natural running count (e.g. boolean-only checks like `chairman`/`party`).
   */
  playerProgress?: ReadonlyArray<{color: Color, score: number}>;
} | undefined;

export type MutationMarketModel = {
  /** Length 6. Index 0 and the last index are inactive-but-visible previews. */
  projectSlots: ReadonlyArray<MutationMarketProjectSlotModel>;
  /** Length 3: position `i` spans projectSlots[2i, 2i+1]. */
  alignedRow: ReadonlyArray<MutationMarketMutationSlotModel>;
  /** Length 4: position 0/3 are half-cards over projectSlots[0]/[last]. */
  offsetRow: ReadonlyArray<MutationMarketMutationSlotModel>;
  offsetRowIsTop: boolean;
};
