import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {newProjectCard} from '../createCard';
import {isCompatibleWith} from '../cards/CardFactorySpec';
import {inplaceShuffle} from '../utils/shuffle';
import {Units} from '../../common/Units';
import {BlackMarketPrice, describeBlackMarketPrice} from '../../common/blackmarket/BlackMarketPrice';
import {BLACKMARKET_CARD_MANIFEST, BLACK_MARKET_DESIGNS, resolveBlackMarketPrice} from '../cards/blackmarket/BlackMarketCardManifest';
import {BlackMarketData, BlackMarketSlot, BLACK_MARKET_SLOT_COUNT, SerializedBlackMarketData} from './BlackMarketData';

/**
 * Black Market: a persistent 5-slot market of bespoke project cards, bought directly for a
 * price set by the market itself (no bidding, no mutation/infection layering -- see
 * MutationMarkets for that). Every Black Market card's own `cost`/`reserveUnits` are always
 * 0/empty (see each card file) -- the price the player actually pays lives entirely here, in
 * `BlackMarketSlot.price`, deducted directly by `buy()` rather than through the card's own
 * play-cost pipeline. See CardName.ts's Black Market comment and
 * BlackMarketCardManifest.ts's doc comments for how "replayable" (buying the same design
 * more than once) and per-printing pricing are made safe/possible without touching the
 * shared project deck or Card.ts's shared properties cache.
 */
export class BlackMarket {
  private constructor() {}

  public static initialize(game: IGame): BlackMarketData {
    const designQueue = BLACK_MARKET_DESIGNS
      .map((_design, index) => index)
      .filter((index) => BlackMarket.isDesignCompatible(index, game));
    inplaceShuffle(designQueue, game.rng);

    const data: BlackMarketData = {
      slots: new Array(BLACK_MARKET_SLOT_COUNT).fill(undefined),
      designQueue,
    };
    for (let i = 0; i < BLACK_MARKET_SLOT_COUNT; i++) {
      data.slots[i] = BlackMarket.startStack(game, data);
    }
    return data;
  }

  /**
   * Buys the card at `slotIndex` for `player`: the market's own price is deducted directly
   * (no substitution -- the price is exactly this bundle), then the card is played through
   * the normal pipeline (behavior, tags, VP, tableau) with no further payment. The same
   * design's next printing (a fresh instance, distinct CardName -- see BlackMarketData.ts)
   * takes over the slot, or a new design if the stack just ran out.
   */
  public static buy(game: IGame, player: IPlayer, slotIndex: number): void {
    const data = BlackMarket.dataOrThrow(game);
    const slot = data.slots[slotIndex];
    if (slot === undefined) {
      throw new Error(`No Black Market card at slot ${slotIndex}`);
    }
    player.stock.deductUnits(Units.of(slot.price));
    player.playCard(slot.card);
    data.slots[slotIndex] = BlackMarket.nextSlot(game, data, slot);
  }

  /** A short, human-readable price label for a slot's price, e.g. "2 titanium" or "2 M€, 1 heat". */
  public static describePrice(slot: BlackMarketSlot): string {
    return slot === undefined ? '' : describeBlackMarketPrice(slot.price);
  }

  private static isDesignCompatible(designIndex: number, game: IGame): boolean {
    const name = BLACK_MARKET_DESIGNS[designIndex].printings[0];
    const factory = BLACKMARKET_CARD_MANIFEST.projectCards[name];
    return factory === undefined || isCompatibleWith(factory, game.gameOptions);
  }

  /** Pulls the next not-yet-shown design off the queue and reveals its first (cheapest) printing, or leaves the slot empty if none remain. */
  private static startStack(game: IGame, data: BlackMarketData): BlackMarketSlot {
    const designIndex = data.designQueue.pop();
    if (designIndex === undefined) {
      return undefined;
    }
    return BlackMarket.buildSlot(game, designIndex, 0);
  }

  /** After a purchase: the same design's next printing if the stack isn't exhausted yet, otherwise a fresh design (or empty, if none remain). */
  private static nextSlot(game: IGame, data: BlackMarketData, bought: NonNullable<BlackMarketSlot>): BlackMarketSlot {
    if (bought.variantIndex < 2) {
      return BlackMarket.buildSlot(game, bought.designIndex, bought.variantIndex + 1);
    }
    return BlackMarket.startStack(game, data);
  }

  private static buildSlot(game: IGame, designIndex: number, variantIndex: number): BlackMarketSlot {
    const design = BLACK_MARKET_DESIGNS[designIndex];
    const name = design.printings[variantIndex];
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown Black Market card ${name}`);
    }
    const price = resolveBlackMarketPrice(design.price, variantIndex, game.rng);
    return {card, designIndex, variantIndex, price};
  }

  private static dataOrThrow(game: IGame): BlackMarketData {
    if (game.blackMarketData === undefined) {
      throw new Error('Black Market is not enabled for this game');
    }
    return game.blackMarketData;
  }

  public static serialize(data: BlackMarketData | undefined): SerializedBlackMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      slots: data.slots.map((slot) => slot === undefined ? undefined : {designIndex: slot.designIndex, variantIndex: slot.variantIndex, price: slot.price}),
      designQueue: data.designQueue,
    };
  }

  public static deserialize(data: SerializedBlackMarketData | undefined): BlackMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      slots: data.slots.map((slot) => BlackMarket.deserializeSlot(slot)),
      designQueue: data.designQueue,
    };
  }

  private static deserializeSlot(slot: {designIndex: number, variantIndex: number, price: BlackMarketPrice} | undefined): BlackMarketSlot {
    if (slot === undefined) {
      return undefined;
    }
    const name = BLACK_MARKET_DESIGNS[slot.designIndex].printings[slot.variantIndex];
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown Black Market card ${name}`);
    }
    return {card, designIndex: slot.designIndex, variantIndex: slot.variantIndex, price: slot.price};
  }
}
