import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {newProjectCard} from '../createCard';
import {isCompatibleWith} from '../cards/CardFactorySpec';
import {inplaceShuffle} from '../utils/shuffle';
import {Units} from '../../common/Units';
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
 * 4-slot stack-based supply, revealed as the game reaches that generation. There's no bidding
 * and no mutation/infection layering (see MutationMarkets for that) -- you just do the
 * project right there, publicly, for its own printed price (M€ via `cost`, everything else
 * via `reserveUnits`, exactly like any other card's play cost). See CardName.ts's Black
 * Market comment and BlackMarketCardManifest.ts's doc comments for how "replayable" (doing
 * the same design more than once) and per-printing pricing are made safe/possible without
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
   * Does the project at `tier`/`slotIndex` for `player`: `player.playCard` enforces and
   * deducts both the M€ `cost` and the non-M€ `reserveUnits` bundle (no substitution) exactly
   * like playing any other card, then resolves its behavior and adds it to the player's
   * tableau. The same design's next printing (a fresh instance, distinct CardName -- see
   * BlackMarketData.ts) takes over the slot, or a new design (same tier) if the stack just
   * ran out.
   */
  public static buy(game: IGame, player: IPlayer, tier: BlackMarketTier, slotIndex: number): void {
    const row = BlackMarket.rowOrThrow(game, tier);
    const slot = row.slots[slotIndex];
    if (slot === undefined) {
      throw new Error(`No Black Market card at ${tier}[${slotIndex}]`);
    }
    player.playCard(slot.card);
    row.slots[slotIndex] = BlackMarket.nextSlot(row, slot);
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
    const designQueue = BLACK_MARKET_DESIGNS
      .map((_design, index) => index)
      .filter((index) => BLACK_MARKET_DESIGNS[index].tier === tier && BlackMarket.isDesignCompatible(index, game));
    inplaceShuffle(designQueue, game.rng);

    const row: BlackMarketRowData = {
      slots: new Array(BLACK_MARKET_ROW_SLOT_COUNT).fill(undefined),
      designQueue,
    };
    for (let i = 0; i < BLACK_MARKET_ROW_SLOT_COUNT; i++) {
      row.slots[i] = BlackMarket.startStack(row);
    }
    return row;
  }

  /** Pulls the next not-yet-shown design off the row's queue and reveals its first (cheapest) printing, or leaves the slot empty if none remain. */
  private static startStack(row: BlackMarketRowData): BlackMarketSlot {
    const designIndex = row.designQueue.pop();
    if (designIndex === undefined) {
      return undefined;
    }
    return BlackMarket.buildSlot(designIndex, 0);
  }

  /** After a purchase: the same design's next printing if the stack isn't exhausted yet, otherwise a fresh design from the same row (or empty, if none remain). */
  private static nextSlot(row: BlackMarketRowData, bought: NonNullable<BlackMarketSlot>): BlackMarketSlot {
    if (bought.variantIndex < 2) {
      return BlackMarket.buildSlot(bought.designIndex, bought.variantIndex + 1);
    }
    return BlackMarket.startStack(row);
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
      designQueue: row.designQueue,
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
      designQueue: row.designQueue,
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
