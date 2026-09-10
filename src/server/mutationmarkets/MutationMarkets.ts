import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Color} from '../../common/Color';
import {PlayerId} from '../../common/Types';
import {Resource} from '../../common/Resource';
import {newProjectCard} from '../createCard';
import {MutationName} from '../../common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {MutationEffects} from './MutationEffects';
import {InfectionName} from '../../common/mutationmarkets/InfectionName';
import {InfectionEffects} from './InfectionEffects';
import {MarketSlotContent} from '../../common/mutationmarkets/MarketSlotContent';
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
      mutationDrawPile: MutationMarkets.shuffledMarketSlotContents(game),
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

  /** Removes the mutation/infection at `row[index]`, slides earlier ones toward the gap, and deals one fresh one in from the left. */
  public static claimMutationSlot(game: IGame, row: MutationRow, index: number): MarketSlotContent {
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
    return claimed;
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
        (content) => MutationMarkets.qualifiesFor(content, player, card));
      if (qualifies) {
        result.push(index);
      }
    }
    return result;
  }

  /**
   * Called when `card` is played. Applies every "on play" mutation effect currently
   * applied to it: a flat resource/production grant, and (only for `convertType` landing
   * on an Active card, where the type flip itself doesn't apply -- see
   * `MutationEffects.applyType`) the M€ rebate fallback.
   */
  public static applyOnPlayEffects(player: IPlayer, card: ICard): void {
    if (card.mutations === undefined) {
      return;
    }
    for (const applied of card.mutations) {
      const effect = MUTATION_DEFINITIONS[applied.mutation].effect;
      switch (effect.kind) {
      case 'grantResourceOnPlay':
        player.stock.add(effect.resource, effect.amount, {log: true});
        break;
      case 'grantProductionOnPlay':
        player.production.add(effect.resource, effect.amount, {log: true});
        break;
      case 'convertType':
        if (card.baseType === CardType.ACTIVE) {
          player.stock.add(Resource.MEGACREDITS, MutationEffects.rebateAmount(card.baseCost ?? 0), {log: true});
        }
        break;
      }
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
    // (uniqueTags, expensiveCardsPlayed, cheapCardsPlayed, cities, greeneries, oceans,
    // tag, production) read the `card` parameter -- it's only there for card-specific
    // requirements (e.g. a card's own tags), which mutations don't use.
    const noCard = undefined as unknown as IProjectCard;
    return game.players.map((player) => ({color: player.color, score: compiled.getScore(player, noCard)}));
  }

  /**
   * A project slot's minimum bid is fixed by its position, not by which mutation(s)
   * cover it -- descending left to right across the four active slots (2-5, 1-indexed).
   * Slot 2 just picked up a newly-paired covering mutation, the priciest position (4);
   * slot 5 is a freshly-dealt card entering active status for the first time, the
   * cheapest (1).
   */
  private static readonly MINIMUM_BID_BY_PROJECT_SLOT: Readonly<Record<number, number>> = {1: 4, 2: 3, 3: 2, 4: 1};

  /** The fixed minimum bid for `slotIndex` (only meaningful for the four active slots, 1-4). */
  public static minimumBidFor(slotIndex: number): number {
    return MutationMarkets.MINIMUM_BID_BY_PROJECT_SLOT[slotIndex] ?? 1;
  }

  /** The smallest bid that would currently win/open the auction on this slot. */
  public static nextBidFor(data: MutationMarketData, slotIndex: number): number {
    const auction = data.projectAuctions[slotIndex];
    const currentHigh = auction === undefined ? 0 : auction.escrow[auction.highBidder];
    return Math.max(MutationMarkets.minimumBidFor(slotIndex), currentHigh + 1);
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

  /** Refunds every losing bidder, applies whichever covering mutations/infections the winner qualifies for, and hands the card over -- that's the entire prize, there's no separate reward. */
  private static settleAuction(game: IGame, data: MutationMarketData, slotIndex: number, auction: OpenAuction, card: IProjectCard): void {
    const winner = MutationMarkets.playerById(game, auction.highBidder);
    for (const playerId of Object.keys(auction.escrow) as Array<PlayerId>) {
      if (playerId !== auction.highBidder) {
        MutationMarkets.playerById(game, playerId).stock.add(Resource.MEGACREDITS, auction.escrow[playerId], {log: true});
      }
    }

    const qualifying = MutationMarkets.coveringMutations(data, slotIndex).filter(
      (content) => MutationMarkets.qualifiesFor(content, winner, card));
    for (const content of qualifying) {
      if (content.kind === 'mutation') {
        const applied = MutationEffects.apply(card, content.mutation, game.rng, game.gameOptions.expansions);
        card.mutations = card.mutations === undefined ? [applied] : [...card.mutations, applied];
      } else {
        const applied = InfectionEffects.apply(content.infection);
        card.infections = card.infections === undefined ? [applied] : [...card.infections, applied];
      }
    }

    winner.cardsInHand.push(card);
    game.log('${0} won the auction for ${1} for ${2} M€', (b) => b.player(winner).card(card).number(auction.escrow[auction.highBidder]));
  }

  /** An infection has no bidding requirement -- it always qualifies. A mutation only qualifies if the player satisfies its printed requirement. */
  private static qualifiesFor(content: MarketSlotContent, player: IPlayer, card: IProjectCard): boolean {
    if (content.kind === 'infection') {
      return true;
    }
    return CardRequirements.compile([MUTATION_DEFINITIONS[content.mutation].requirement]).satisfies(player, card);
  }

  /** The active mutations/infections (from either row) covering `slotIndex`. */
  public static coveringMutations(data: MutationMarketData, slotIndex: number): Array<MarketSlotContent> {
    return [
      ...MutationMarkets.coveringMutationsForRow(data, 'alignedRow', slotIndex),
      ...MutationMarkets.coveringMutationsForRow(data, 'offsetRow', slotIndex),
    ];
  }

  /**
   * Same list as `coveringMutations`, split by which physical row (above/below the
   * project row) each one currently occupies -- `alignedRow`/`offsetRow` swap which is
   * physically "top" each generation (`data.offsetRowIsTop`), so the market UI needs this
   * mapped to "above"/"below", not the raw row name.
   */
  public static coveringMutationsByRow(data: MutationMarketData, slotIndex: number): {above: Array<MarketSlotContent>, below: Array<MarketSlotContent>} {
    const aboveRow: MutationRow = data.offsetRowIsTop ? 'offsetRow' : 'alignedRow';
    const belowRow: MutationRow = data.offsetRowIsTop ? 'alignedRow' : 'offsetRow';
    return {
      above: MutationMarkets.coveringMutationsForRow(data, aboveRow, slotIndex),
      below: MutationMarkets.coveringMutationsForRow(data, belowRow, slotIndex),
    };
  }

  private static coveringMutationsForRow(data: MutationMarketData, row: MutationRow, slotIndex: number): Array<MarketSlotContent> {
    const slots = data[row];
    const result: Array<MarketSlotContent> = [];
    for (let index = 0; index < slots.length; index++) {
      const slot = slots[index];
      if (slot === undefined || !MutationMarkets.isMutationSlotActive(row, index, data)) {
        continue;
      }
      if (MutationMarkets.linkedProjectSlots(row, index).includes(slotIndex)) {
        result.push(slot);
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

  /** Mutation rows always shift one position to the right at generation end -- the exiting slot is discarded, and a fresh mutation/infection enters from the left. */
  private static shiftRow(game: IGame, data: MutationMarketData, row: MutationRow): void {
    const slots = data[row];
    const exiting = slots[slots.length - 1];
    if (exiting !== undefined) {
      data.mutationDiscardPile.push(exiting);
    }
    for (let j = slots.length - 1; j > 0; j--) {
      slots[j] = slots[j - 1];
    }
    slots[0] = MutationMarkets.dealMutation(game, data);
  }

  private static dataOrThrow(game: IGame): MutationMarketData {
    if (game.mutationMarketData === undefined) {
      throw new Error('MutationMarkets is not enabled for this game');
    }
    return game.mutationMarketData;
  }

  /** One shared shuffled pool of every Mutation and every Infection, unweighted -- roughly 3-in-16 dealt slots are infections today, purely a function of there being fewer infection types. */
  private static shuffledMarketSlotContents(game: IGame): Array<MarketSlotContent> {
    const contents: Array<MarketSlotContent> = [
      ...Object.values(MutationName).map((mutation): MarketSlotContent => ({kind: 'mutation', mutation})),
      ...Object.values(InfectionName).map((infection): MarketSlotContent => ({kind: 'infection', infection})),
    ];
    inplaceShuffle(contents, game.rng);
    return contents;
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
    return data.mutationDrawPile.pop();
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
