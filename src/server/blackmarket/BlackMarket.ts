import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {newProjectCard} from '../createCard';
import {isCompatibleWith} from '../cards/CardFactorySpec';
import {inplaceShuffle} from '../utils/shuffle';
import {Units} from '../../common/Units';
import {BLACKMARKET_CARD_MANIFEST, BLACK_MARKET_DESIGNS} from '../cards/blackmarket/BlackMarketCardManifest';
import {BlackMarketData, BlackMarketSlot, BLACK_MARKET_SLOT_COUNT, SerializedBlackMarketData} from './BlackMarketData';

const UNIT_LABELS: Record<keyof Units, string> = {
  megacredits: 'M€',
  steel: 'steel',
  titanium: 'titanium',
  plants: 'plant',
  energy: 'energy',
  heat: 'heat',
};

/**
 * Black Market: a persistent 5-slot market of bespoke project cards. There's no bidding and
 * no mutation/infection layering (see MutationMarkets for that) -- you just do the project
 * right there, publicly, for its own printed price (M€ via `cost`, everything else via
 * `reserveUnits`, exactly like any other card's play cost). See CardName.ts's Black Market
 * comment and BlackMarketCardManifest.ts's doc comments for how "replayable" (doing the same
 * design more than once) and per-printing pricing are made safe/possible without touching
 * the shared project deck or Card.ts's shared properties cache.
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
   * Does the project at `slotIndex` for `player`: `player.playCard` enforces and deducts
   * both the M€ `cost` and the non-M€ `reserveUnits` bundle (no substitution) exactly like
   * playing any other card, then resolves its behavior and adds it to the player's tableau.
   * The same design's next printing (a fresh instance, distinct CardName -- see
   * BlackMarketData.ts) takes over the slot, or a new design if the stack just ran out.
   */
  public static buy(game: IGame, player: IPlayer, slotIndex: number): void {
    const data = BlackMarket.dataOrThrow(game);
    const slot = data.slots[slotIndex];
    if (slot === undefined) {
      throw new Error(`No Black Market card at slot ${slotIndex}`);
    }
    player.playCard(slot.card);
    data.slots[slotIndex] = BlackMarket.nextSlot(game, data, slot);
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
    const param = design.price.kind === 'variable' ?
      design.price.minCost + game.rng.nextInt(design.price.maxCost - design.price.minCost + 1) :
      design.price.variants[variantIndex];
    const card = design.build(name, param);
    return {card, designIndex, variantIndex};
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
      slots: data.slots.map((slot) => slot === undefined ? undefined : {designIndex: slot.designIndex, variantIndex: slot.variantIndex}),
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

  private static deserializeSlot(slot: {designIndex: number, variantIndex: number} | undefined): BlackMarketSlot {
    if (slot === undefined) {
      return undefined;
    }
    // Reconstructs via the plain zero-arg manifest factory, which resets a variable-cost
    // printing's price back to its default rather than replaying the original roll -- a
    // disclosed, deliberate simplification; only matters across a server restart mid-game.
    const design = BLACK_MARKET_DESIGNS[slot.designIndex];
    const name = design.printings[slot.variantIndex];
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown Black Market card ${name}`);
    }
    return {card, designIndex: slot.designIndex, variantIndex: slot.variantIndex};
  }
}
