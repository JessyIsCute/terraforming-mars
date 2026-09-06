import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {Color} from '../../common/Color';
import {PlayerId} from '../../common/Types';
import {Resource} from '../../common/Resource';
import {newProjectCard} from '../createCard';
import {MutationName} from '../../common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {MutationEffects} from './MutationEffects';
import {CardRequirementDescriptor} from '../../common/cards/CardRequirementDescriptor';
import {CardRequirements} from '../cards/requirements/CardRequirements';
import {InequalityRequirement} from '../cards/requirements/InequalityRequirement';
import {inplaceShuffle} from '../utils/shuffle';
import {MutationMarketData, MutationRow, MutationSlot, OpenAuction, SerializedMutationMarketData} from './MutationMarketData';

const PROJECT_SLOT_COUNT = 6;
const ALIGNED_ROW_LENGTH = 3;
const OFFSET_ROW_LENGTH = 4;

/**
 * MutationMarkets Phase 1: the market skeleton (layout, initialization, per-slot refill
 * on claim, and the generation-end bulk shift). Bidding/auctions (Phase 2) and applying a
 * mutation's ongoing effect to a won card (Phase 3) are not implemented here.
 */
export class MutationMarkets {
  private constructor() {}

  public static initialize(game: IGame): MutationMarketData {
    const data: MutationMarketData = {
      projectSlots: game.projectDeck.drawNOrThrow(game, PROJECT_SLOT_COUNT),
      projectAuctions: new Array(PROJECT_SLOT_COUNT).fill(undefined),
      alignedRow: new Array(ALIGNED_ROW_LENGTH).fill(undefined),
      offsetRow: new Array(OFFSET_ROW_LENGTH).fill(undefined),
      offsetRowIsTop: false,
      mutationDrawPile: MutationMarkets.shuffledMutationNames(game),
      mutationDiscardPile: [],
    };

    for (let i = 0; i < ALIGNED_ROW_LENGTH; i++) {
      data.alignedRow[i] = MutationMarkets.dealMutation(game, data);
    }
    for (let i = 0; i < OFFSET_ROW_LENGTH; i++) {
      data.offsetRow[i] = MutationMarkets.dealMutation(game, data);
    }
    return data;
  }

  /** Slot 0 and the last slot are inactive-but-visible previews; the rest are active/purchasable. */
  public static isProjectSlotActive(index: number): boolean {
    return index > 0 && index < PROJECT_SLOT_COUNT - 1;
  }

  /**
   * The project-slot index (or indices) a mutation-row position spans. Purely a function
   * of row + position -- as a mutation slides across positions (claims/shifts), which
   * project slots it covers changes with it.
   */
  public static linkedProjectSlots(row: MutationRow, index: number): [number | undefined, number | undefined] {
    if (row === 'alignedRow') {
      return [index * 2, index * 2 + 1];
    }
    switch (index) {
    case 0: return [undefined, 0];
    case 1: return [1, 2];
    case 2: return [3, 4];
    case 3: return [PROJECT_SLOT_COUNT - 1, undefined];
    default: throw new Error(`Invalid offset row index ${index}`);
    }
  }

  /** A mutation touching an inactive/preview project slot (0 or the last index) is itself inactive-but-visible. */
  public static isMutationSlotActive(row: MutationRow, index: number, data: MutationMarketData): boolean {
    if (data[row][index] === undefined) {
      return false;
    }
    return MutationMarkets.linkedProjectSlots(row, index).every(
      (slotIndex) => slotIndex === undefined || MutationMarkets.isProjectSlotActive(slotIndex));
  }

  /**
   * Removes the project card at `index`, slides cards after it toward the gap (carrying
   * any open auctions on those slots along with them), and deals one fresh card in from
   * the right.
   */
  public static claimProjectSlot(game: IGame, index: number): IProjectCard {
    const data = MutationMarkets.dataOrThrow(game);
    const claimed = data.projectSlots[index];
    if (claimed === undefined) {
      throw new Error(`No project card at slot ${index}`);
    }
    for (let i = index; i < PROJECT_SLOT_COUNT - 1; i++) {
      data.projectSlots[i] = data.projectSlots[i + 1];
      data.projectAuctions[i] = data.projectAuctions[i + 1];
    }
    data.projectSlots[PROJECT_SLOT_COUNT - 1] = game.projectDeck.drawNOrThrow(game, 1)[0];
    data.projectAuctions[PROJECT_SLOT_COUNT - 1] = undefined;
    return claimed;
  }

  /** Removes the mutation at `row[index]`, slides earlier mutations toward the gap, and deals one fresh mutation in from the left. */
  public static claimMutationSlot(game: IGame, row: MutationRow, index: number): MutationName {
    const data = MutationMarkets.dataOrThrow(game);
    const slots = data[row];
    const claimed = slots[index];
    if (claimed === undefined) {
      throw new Error(`No mutation at ${row}[${index}]`);
    }
    for (let i = index; i > 0; i--) {
      slots[i] = slots[i - 1];
    }
    slots[0] = MutationMarkets.dealMutation(game, data);
    return claimed.mutation;
  }

  public static onGenerationEnd(game: IGame): void {
    const data = game.mutationMarketData;
    if (data === undefined) {
      return;
    }

    // Sweep every still-open auction before the bulk shift runs. Settle in place (no
    // shifting) so slot indices stay stable for the shift math below; a settled slot
    // gets an immediate replacement rather than being shifted, since the deck deal
    // happening a few lines down is unaware individual slots were just vacated.
    for (let index = 0; index < PROJECT_SLOT_COUNT; index++) {
      const auction = data.projectAuctions[index];
      const card = data.projectSlots[index];
      if (auction !== undefined && card !== undefined) {
        MutationMarkets.settleAuction(game, data, index, auction, card);
        data.projectSlots[index] = game.projectDeck.drawNOrThrow(game, 1)[0];
        data.projectAuctions[index] = undefined;
      }
    }

    for (const exiting of data.projectSlots.slice(0, 3)) {
      if (exiting !== undefined) {
        game.projectDeck.discard(exiting);
      }
    }
    for (let i = 0; i < 3; i++) {
      data.projectSlots[i] = data.projectSlots[i + 3];
      data.projectAuctions[i] = data.projectAuctions[i + 3];
    }
    const fresh = game.projectDeck.drawNOrThrow(game, 3);
    for (let i = 0; i < 3; i++) {
      data.projectSlots[3 + i] = fresh[i];
      data.projectAuctions[3 + i] = undefined;
    }

    MutationMarkets.shiftRow(game, data, 'alignedRow');
    MutationMarkets.shiftRow(game, data, 'offsetRow');

    data.offsetRowIsTop = !data.offsetRowIsTop;
  }

  /** Active project slots a bidder currently qualifies to bid on (covered by a mutation whose requirement they satisfy). */
  public static biddableSlots(game: IGame, player: IPlayer): Array<number> {
    const data = game.mutationMarketData;
    if (data === undefined) {
      return [];
    }
    const result: Array<number> = [];
    for (let index = 0; index < PROJECT_SLOT_COUNT; index++) {
      if (!MutationMarkets.isProjectSlotActive(index)) {
        continue;
      }
      const card = data.projectSlots[index];
      if (card === undefined) {
        continue;
      }
      const qualifies = MutationMarkets.coveringMutations(data, index).some(
        (mutation) => CardRequirements.compile([MUTATION_DEFINITIONS[mutation].requirement]).satisfies(player, card));
      if (qualifies) {
        result.push(index);
      }
    }
    return result;
  }

  /**
   * Nested Mutation: called when `card` is played. Grants a fresh, separately-discounted
   * copy of it to `player`'s hand for each qualifying `nestedCopy` mutation applied to it.
   * A copy carries only a baked-in cost delta (`AppliedMutation.bakedCostDelta`), not the
   * `nestedCopy` effect itself, so playing the copy doesn't spawn yet another one.
   */
  public static maybeGrantNestedCopy(player: IPlayer, card: ICard): void {
    if (card.mutations === undefined) {
      return;
    }
    for (const applied of card.mutations) {
      if (applied.bakedCostDelta !== undefined) {
        continue;
      }
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      if (effect.kind !== 'nestedCopy') {
        continue;
      }
      const copy = newProjectCard(card.name);
      if (copy === undefined) {
        continue;
      }
      const delta = MutationEffects.nestedCopyDelta(copy.baseCost ?? 0, effect);
      copy.mutations = [{mutation: applied.mutation, bakedCostDelta: delta}];
      player.cardsInHand.push(copy);
      player.game.log('${0} received a discounted copy of ${1} from Nested Mutation', (b) => b.player(player).card(copy));
    }
  }

  /**
   * Each player's current numeric progress toward a mutation's requirement, for the
   * market UI's Milestones/Awards-style live counter. `undefined` for requirement kinds
   * with no natural running count (boolean-only checks like `chairman`/`party`).
   */
  public static playerProgressFor(game: IGame, requirement: CardRequirementDescriptor): Array<{color: Color, score: number}> | undefined {
    const compiled = CardRequirements.compile([requirement]).requirements[0];
    if (!(compiled instanceof InequalityRequirement)) {
      return undefined;
    }
    // None of the InequalityRequirement subclasses MutationDefinitions actually uses
    // (uniqueTags, expensiveCardsPlayed, cheapCardsPlayed, cardCostStreak, cities,
    // greeneries, oceans, tag, production) read the `card` parameter -- it's only there
    // for card-specific requirements (e.g. a card's own tags), which mutations don't use.
    const noCard = undefined as unknown as IProjectCard;
    return game.players.map((player) => ({color: player.color, score: compiled.getScore(player, noCard)}));
  }

  /** The higher of the covering (active) mutations' printed minimum bid. */
  public static minimumBidFor(data: MutationMarketData, slotIndex: number): number {
    const minimums = MutationMarkets.coveringMutations(data, slotIndex).map((mutation) => MUTATION_DEFINITIONS[mutation].minimumBid);
    return minimums.length > 0 ? Math.max(...minimums) : 1;
  }

  /** The smallest bid that would currently win/open the auction on this slot. */
  public static nextBidFor(data: MutationMarketData, slotIndex: number): number {
    const auction = data.projectAuctions[slotIndex];
    const currentHigh = auction === undefined ? 0 : auction.escrow[auction.highBidder];
    return Math.max(MutationMarkets.minimumBidFor(data, slotIndex), currentHigh + 1);
  }

  /**
   * Escrows `amount` M€ from `player` as their bid on `slotIndex` (only the incremental
   * difference above their own existing escrow on this auction, if any, is deducted) and
   * makes them the new high bidder.
   */
  public static placeBid(game: IGame, player: IPlayer, slotIndex: number, amount: number): void {
    const data = MutationMarkets.dataOrThrow(game);
    const card = data.projectSlots[slotIndex];
    if (card === undefined || !MutationMarkets.isProjectSlotActive(slotIndex)) {
      throw new Error(`Cannot bid on market slot ${slotIndex}`);
    }
    const nextBid = MutationMarkets.nextBidFor(data, slotIndex);
    if (amount < nextBid) {
      throw new Error(`Bid must be at least ${nextBid} M€`);
    }
    let auction = data.projectAuctions[slotIndex];
    const existingEscrow = auction?.escrow[player.id] ?? 0;
    player.stock.deduct(Resource.MEGACREDITS, amount - existingEscrow, {log: true});
    if (auction === undefined) {
      auction = {highBidder: player.id, escrow: {}, resolutionCheckpoint: player.id};
      data.projectAuctions[slotIndex] = auction;
    }
    auction.escrow[player.id] = amount;
    auction.highBidder = player.id;
    auction.resolutionCheckpoint = player.id;
    game.log('${0} bid ${1} M€ on ${2}', (b) => b.player(player).number(amount).card(card));
  }

  /**
   * Called as `player`'s turn begins. If the table has gone all the way around to the
   * current high bidder without a counter-bid in between (i.e. every still-active
   * player's turn started, and none of them outbid), the auction resolves now.
   */
  public static resolveIfReturned(game: IGame, player: IPlayer): void {
    const data = game.mutationMarketData;
    if (data === undefined) {
      return;
    }
    for (let index = 0; index < PROJECT_SLOT_COUNT; index++) {
      const auction = data.projectAuctions[index];
      if (auction !== undefined && auction.resolutionCheckpoint === player.id) {
        MutationMarkets.resolveAuction(game, index);
      }
    }
  }

  /** Settles the auction on `slotIndex` (if any) and pulls in a replacement card from the right, same as any other claim. */
  public static resolveAuction(game: IGame, slotIndex: number): void {
    const data = MutationMarkets.dataOrThrow(game);
    const auction = data.projectAuctions[slotIndex];
    const card = data.projectSlots[slotIndex];
    if (auction === undefined || card === undefined) {
      return;
    }
    MutationMarkets.settleAuction(game, data, slotIndex, auction, card);
    MutationMarkets.claimProjectSlot(game, slotIndex);
  }

  /** Refunds every losing bidder, applies whichever covering mutations the winner qualifies for, grants rewards, and hands the card over. */
  private static settleAuction(game: IGame, data: MutationMarketData, slotIndex: number, auction: OpenAuction, card: IProjectCard): void {
    const winner = MutationMarkets.playerById(game, auction.highBidder);
    for (const playerId of Object.keys(auction.escrow) as Array<PlayerId>) {
      if (playerId !== auction.highBidder) {
        MutationMarkets.playerById(game, playerId).stock.add(Resource.MEGACREDITS, auction.escrow[playerId], {log: true});
      }
    }

    const qualifyingMutations = MutationMarkets.coveringMutations(data, slotIndex).filter(
      (mutation) => CardRequirements.compile([MUTATION_DEFINITIONS[mutation].requirement]).satisfies(winner, card));
    for (const mutation of qualifyingMutations) {
      const applied = MutationEffects.apply(card, mutation, game.rng);
      const reward = MUTATION_DEFINITIONS[mutation].reward;
      if (reward.tr !== undefined) {
        winner.increaseTerraformRating(reward.tr, {log: true});
      }
      if (reward.megacredits !== undefined) {
        winner.stock.add(Resource.MEGACREDITS, reward.megacredits, {log: true});
      }
      if (reward.cards !== undefined) {
        winner.drawCard(reward.cards);
      }
      if (reward.victoryPoints !== undefined) {
        applied.oneTimeVictoryPointsGranted = reward.victoryPoints;
      }
      card.mutations = card.mutations === undefined ? [applied] : [...card.mutations, applied];
    }

    winner.cardsInHand.push(card);
    game.log('${0} won the auction for ${1} for ${2} M€', (b) => b.player(winner).card(card).number(auction.escrow[auction.highBidder]));
  }

  /** The active mutations (from either row) covering `slotIndex`. */
  public static coveringMutations(data: MutationMarketData, slotIndex: number): Array<MutationName> {
    const result: Array<MutationName> = [];
    for (const row of ['alignedRow', 'offsetRow'] as const) {
      const slots = data[row];
      for (let index = 0; index < slots.length; index++) {
        const slot = slots[index];
        if (slot === undefined || !MutationMarkets.isMutationSlotActive(row, index, data)) {
          continue;
        }
        if (MutationMarkets.linkedProjectSlots(row, index).includes(slotIndex)) {
          result.push(slot.mutation);
        }
      }
    }
    return result;
  }

  private static playerById(game: IGame, id: PlayerId): IPlayer {
    const player = game.players.find((candidate) => candidate.id === id);
    if (player === undefined) {
      throw new Error(`No player ${id} in game ${game.id}`);
    }
    return player;
  }

  private static shiftRow(game: IGame, data: MutationMarketData, row: MutationRow): void {
    const slots = data[row];
    const steps = slots.reduce((sum, _slot, index) => {
      if (!MutationMarkets.isMutationSlotActive(row, index, data)) {
        return sum;
      }
      const mutation = slots[index];
      return sum + (mutation === undefined ? 0 : MUTATION_DEFINITIONS[mutation.mutation].steps);
    }, 0);

    for (let i = 0; i < steps; i++) {
      const exiting = slots[slots.length - 1];
      if (exiting !== undefined) {
        data.mutationDiscardPile.push(exiting.mutation);
      }
      for (let j = slots.length - 1; j > 0; j--) {
        slots[j] = slots[j - 1];
      }
      slots[0] = MutationMarkets.dealMutation(game, data);
    }
  }

  private static dataOrThrow(game: IGame): MutationMarketData {
    if (game.mutationMarketData === undefined) {
      throw new Error('MutationMarkets is not enabled for this game');
    }
    return game.mutationMarketData;
  }

  private static shuffledMutationNames(game: IGame): Array<MutationName> {
    const names = Object.values(MutationName);
    inplaceShuffle(names, game.rng);
    return names;
  }

  private static dealMutation(game: IGame, data: MutationMarketData): MutationSlot {
    if (data.mutationDrawPile.length === 0) {
      if (data.mutationDiscardPile.length === 0) {
        return undefined;
      }
      data.mutationDrawPile = data.mutationDiscardPile;
      data.mutationDiscardPile = [];
      inplaceShuffle(data.mutationDrawPile, game.rng);
    }
    const mutation = data.mutationDrawPile.pop();
    return mutation === undefined ? undefined : {mutation};
  }

  public static serialize(data: MutationMarketData | undefined): SerializedMutationMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      ...data,
      projectSlots: data.projectSlots.map((card) => card?.name),
    };
  }

  public static deserialize(data: SerializedMutationMarketData | undefined): MutationMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      ...data,
      projectSlots: data.projectSlots.map((name) => MutationMarkets.deserializeProjectSlot(name)),
    };
  }

  private static deserializeProjectSlot(name: CardName | undefined): IProjectCard | undefined {
    if (name === undefined) {
      return undefined;
    }
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown MutationMarkets project card ${name}`);
    }
    return card;
  }
}
