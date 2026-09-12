import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {newProjectCard} from '../createCard';
import {isCompatibleWith} from '../cards/CardFactorySpec';
import {inplaceShuffle} from '../utils/shuffle';
import {Units} from '../../common/Units';
import {Payment} from '../../common/inputs/Payment';
import {MoonExpansion} from '../moon/MoonExpansion';
import {
  BLACKMARKET_CARD_MANIFEST,
  BLACK_MARKET_DESIGNS,
  BLACK_MARKET_TIER_UNLOCK_GENERATION,
  BlackMarketTier,
} from '../cards/blackmarket/BlackMarketCardManifest';
import {
  BlackMarketData,
  BlackMarketRowData,
  BlackMarketSlot,
  BLACK_MARKET_ROW_SLOT_COUNT,
  SerializedBlackMarketData,
  SerializedBlackMarketRowData,
} from './BlackMarketData';

const UNIT_LABELS: Record<keyof Units, string> = {
  megacredits: 'M€',
  steel: 'steel',
  titanium: 'titanium',
  plants: 'plant',
  energy: 'energy',
  heat: 'heat',
};

/**
 * Black Market: a persistent market of bespoke project cards, split into 3 era rows --
 * early (from the start), mid (generation 4+), late (generation 7+) -- each with its own
 * 4-slot supply, revealed as the game reaches that generation. There's no bidding and no
 * mutation/infection layering (see MutationMarkets for that) -- you just do the project right
 * there, publicly, for its own printed price (M€ via `cost`, everything else via
 * `reserveUnits`, exactly like any other card's play cost). Buying a slot empties it
 * immediately. At the end of every generation each row shifts one slot to the left -- the
 * leftmost card (bought or not) is discarded, everything else slides down, and a fresh
 * printing is dealt into the newly-open rightmost slot -- a plain conveyor, closer to
 * MutationMarkets' own end-of-generation shift than a per-slot refill. See CardName.ts's Black
 * Market comment and BlackMarketCardManifest.ts's doc comments for how "replayable" (doing the
 * same design more than once) and per-printing pricing are made safe/possible without
 * touching the shared project deck or Card.ts's shared properties cache.
 */
export class BlackMarket {
  private constructor() {}

  public static initialize(game: IGame): BlackMarketData {
    return {
      early: BlackMarket.initializeRow(game, 'early'),
      mid: undefined,
      late: undefined,
    };
  }

  /**
   * Called as a new generation begins (`game.generation` already reflects the new number).
   * Unlocks the mid/late row for the first time once the game reaches that tier's threshold.
   */
  public static onGenerationStart(game: IGame): void {
    const data = game.blackMarketData;
    if (data === undefined) {
      return;
    }
    if (data.mid === undefined && game.generation >= BLACK_MARKET_TIER_UNLOCK_GENERATION.mid) {
      data.mid = BlackMarket.initializeRow(game, 'mid');
    }
    if (data.late === undefined && game.generation >= BLACK_MARKET_TIER_UNLOCK_GENERATION.late) {
      data.late = BlackMarket.initializeRow(game, 'late');
    }
  }

  /**
   * Called as the current generation ends, before `onGenerationStart` runs for the next one --
   * mirrors MutationMarkets' own generation-end shift. Every unlocked row's leftmost slot
   * (bought or still sitting there unsold, doesn't matter) is discarded, every other slot
   * shifts one position left, and a fresh printing is dealt into the newly-open rightmost slot.
   */
  public static onGenerationEnd(game: IGame): void {
    const data = game.blackMarketData;
    if (data === undefined) {
      return;
    }
    BlackMarket.shiftRow(data.early);
    if (data.mid !== undefined) {
      BlackMarket.shiftRow(data.mid);
    }
    if (data.late !== undefined) {
      BlackMarket.shiftRow(data.late);
    }
  }

  private static shiftRow(row: BlackMarketRowData): void {
    for (let i = 0; i < row.slots.length - 1; i++) {
      row.slots[i] = row.slots[i + 1];
    }
    row.slots[row.slots.length - 1] = BlackMarket.dealNext(row);
  }

  /**
   * Whether `player` can do `card` right now: the card's own normal requirements (tags,
   * production/global-parameter gates, etc. -- `Card.canPlay`) plus a plain, no-substitution
   * balance check against its real price -- `getCardCost` (M€, after any discounts like
   * Corrupt Office's) and its `reserveUnits` bundle (adjusted for Moon habitat rates, same as
   * a normal play). Deliberately bypasses `Player.canPlay`'s usual alternate-payment options
   * (Building-tag steel, Space-tag titanium, etc.) -- Black Market prices are meant to be paid
   * exactly as printed, and mixing in substitution here would let this check say "affordable"
   * while `buy`'s straight M€ `Payment` below still comes up short.
   */
  public static canAfford(player: IPlayer, card: IProjectCard): boolean {
    const cost = player.getCardCost(card);
    const reserveUnits = MoonExpansion.adjustedReserveCosts(player, card);
    if (!player.stock.has(Units.of({...reserveUnits, megacredits: cost}))) {
      return false;
    }
    return card.canPlay(player, {cost, reserveUnits});
  }

  /**
   * Does the project at `tier`/`slotIndex` for `player`: pays the card's own printed price --
   * `getCardCost` (M€, after any discounts like Corrupt Office's) via a plain `Payment`, plus
   * the non-M€ `reserveUnits` bundle (no substitution), deducted by the normal play pipeline --
   * then resolves its behavior and adds it to the player's tableau. The slot just goes empty;
   * it stays that way until the row's next generation-end shift.
   */
  public static buy(game: IGame, player: IPlayer, tier: BlackMarketTier, slotIndex: number): void {
    const row = BlackMarket.rowOrThrow(game, tier);
    const slot = row.slots[slotIndex];
    if (slot === undefined) {
      throw new Error(`No Black Market card at ${tier}[${slotIndex}]`);
    }
    if (!BlackMarket.canAfford(player, slot.card)) {
      throw new Error(`Cannot afford ${slot.card.name}`);
    }
    const cost = player.getCardCost(slot.card);
    player.playCard(slot.card, Payment.of({megacredits: cost}));
    row.slots[slotIndex] = undefined;
  }

  /** A short, human-readable price label for a card's own printed price, e.g. "2 titanium" or "2 M€, 1 heat". */
  public static describePrice(card: IProjectCard): string {
    const parts: Array<string> = [];
    if (card.cost > 0) {
      parts.push(`${card.cost} M€`);
    }
    const reserveUnits = card.reserveUnits ?? Units.EMPTY;
    for (const key of Units.keys) {
      if (key === 'megacredits') {
        continue;
      }
      const amount = reserveUnits[key];
      if (amount > 0) {
        parts.push(`${amount} ${UNIT_LABELS[key]}`);
      }
    }
    return parts.length > 0 ? parts.join(', ') : 'free';
  }

  private static isDesignCompatible(designIndex: number, game: IGame): boolean {
    const name = BLACK_MARKET_DESIGNS[designIndex].printings[0];
    const factory = BLACKMARKET_CARD_MANIFEST.projectCards[name];
    return factory === undefined || isCompatibleWith(factory, game.gameOptions);
  }

  private static initializeRow(game: IGame, tier: BlackMarketTier): BlackMarketRowData {
    const printingQueue: Array<{designIndex: number, variantIndex: number}> = [];
    BLACK_MARKET_DESIGNS.forEach((design, designIndex) => {
      if (design.tier === tier && BlackMarket.isDesignCompatible(designIndex, game)) {
        design.printings.forEach((_name, variantIndex) => {
          printingQueue.push({designIndex, variantIndex});
        });
      }
    });
    inplaceShuffle(printingQueue, game.rng);

    const row: BlackMarketRowData = {
      slots: new Array(BLACK_MARKET_ROW_SLOT_COUNT).fill(undefined),
      printingQueue,
    };
    for (let i = 0; i < BLACK_MARKET_ROW_SLOT_COUNT; i++) {
      row.slots[i] = BlackMarket.dealNext(row);
    }
    return row;
  }

  /** Pulls the next not-yet-dealt printing off the row's shuffled queue, or leaves the slot empty if none remain. */
  private static dealNext(row: BlackMarketRowData): BlackMarketSlot {
    const next = row.printingQueue.pop();
    if (next === undefined) {
      return undefined;
    }
    return BlackMarket.buildSlot(next.designIndex, next.variantIndex);
  }

  private static buildSlot(designIndex: number, variantIndex: number): BlackMarketSlot {
    const design = BLACK_MARKET_DESIGNS[designIndex];
    const name = design.printings[variantIndex];
    const card = design.build(name, design.variants[variantIndex]);
    return {card, designIndex, variantIndex};
  }

  private static rowOrThrow(game: IGame, tier: BlackMarketTier): BlackMarketRowData {
    const data = game.blackMarketData;
    if (data === undefined) {
      throw new Error('Black Market is not enabled for this game');
    }
    const row = data[tier];
    if (row === undefined) {
      throw new Error(`Black Market's ${tier} row is not unlocked yet`);
    }
    return row;
  }

  public static serialize(data: BlackMarketData | undefined): SerializedBlackMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      early: BlackMarket.serializeRow(data.early),
      mid: data.mid === undefined ? undefined : BlackMarket.serializeRow(data.mid),
      late: data.late === undefined ? undefined : BlackMarket.serializeRow(data.late),
    };
  }

  private static serializeRow(row: BlackMarketRowData): SerializedBlackMarketRowData {
    return {
      slots: row.slots.map((slot) => slot === undefined ? undefined : {designIndex: slot.designIndex, variantIndex: slot.variantIndex}),
      printingQueue: row.printingQueue,
    };
  }

  public static deserialize(data: SerializedBlackMarketData | undefined): BlackMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      early: BlackMarket.deserializeRow(data.early),
      mid: data.mid === undefined ? undefined : BlackMarket.deserializeRow(data.mid),
      late: data.late === undefined ? undefined : BlackMarket.deserializeRow(data.late),
    };
  }

  private static deserializeRow(row: SerializedBlackMarketRowData): BlackMarketRowData {
    return {
      slots: row.slots.map((slot) => BlackMarket.deserializeSlot(slot)),
      printingQueue: row.printingQueue,
    };
  }

  private static deserializeSlot(slot: {designIndex: number, variantIndex: number} | undefined): BlackMarketSlot {
    if (slot === undefined) {
      return undefined;
    }
    const design = BLACK_MARKET_DESIGNS[slot.designIndex];
    const name = design.printings[slot.variantIndex];
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown Black Market card ${name}`);
    }
    return {card, designIndex: slot.designIndex, variantIndex: slot.variantIndex};
  }
}
