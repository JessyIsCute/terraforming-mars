import {IProjectCard} from '../cards/IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {MutationName} from '../../common/mutationmarkets/MutationName';
import {PlayerId} from '../../common/Types';

export type MutationRow = 'alignedRow' | 'offsetRow';

export type MutationSlot = {mutation: MutationName} | undefined;

/**
 * A live, possibly multi-turn auction on a project slot. `resolutionCheckpoint` is
 * always equal to `highBidder` and is how the "a full round passed with no counter-bid"
 * check works: it's updated on every new high bid, and if it's still equal to whichever
 * player's turn is starting, the table has come all the way around untouched (every
 * still-active player's turn started -- and offered them a chance to outbid -- before
 * the high bidder's turn came back up).
 */
export type OpenAuction = {
  highBidder: PlayerId,
  /** Every bidder's currently-escrowed M€ for this auction; refunded in full to every non-winner on resolution. */
  escrow: Record<PlayerId, number>,
  resolutionCheckpoint: PlayerId,
};

/**
 * Live, in-memory market state (project slots hold real card instances). See
 * `SerializedMutationMarketData` for the on-disk shape.
 */
export type MutationMarketData = {
  /** Length 6. Index 0 and the last index are inactive-but-visible previews. */
  projectSlots: Array<IProjectCard | undefined>;
  /** Length 6, parallel to and shifted in lockstep with `projectSlots` -- an open auction "follows" its card as slots shift. */
  projectAuctions: Array<OpenAuction | undefined>;
  /** Length 3: position `i` spans projectSlots[2i, 2i+1]. */
  alignedRow: Array<MutationSlot>;
  /** Length 4: position 0 spans just projectSlots[0] (half-card), 1 spans [1,2], 2 spans [3,4], 3 spans just the last projectSlots index (half-card). */
  offsetRow: Array<MutationSlot>;
  /** Which of alignedRow/offsetRow is currently rendered as the "top" row; swaps each generation. */
  offsetRowIsTop: boolean;
  mutationDrawPile: Array<MutationName>;
  mutationDiscardPile: Array<MutationName>;
};

/** On-disk shape: project slots hold only the card's name, reconstructed on load. */
export type SerializedMutationMarketData = {
  projectSlots: Array<CardName | undefined>;
  projectAuctions: Array<OpenAuction | undefined>;
  alignedRow: Array<MutationSlot>;
  offsetRow: Array<MutationSlot>;
  offsetRowIsTop: boolean;
  mutationDrawPile: Array<MutationName>;
  mutationDiscardPile: Array<MutationName>;
};
