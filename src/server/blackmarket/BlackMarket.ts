import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {newProjectCard} from '../createCard';
import {isCompatibleWith} from '../cards/CardFactorySpec';
import {inplaceShuffle} from '../utils/shuffle';
import {BLACKMARKET_CARD_MANIFEST, BLACK_MARKET_PRINTINGS} from '../cards/blackmarket/BlackMarketCardManifest';
import {UraniumSmuggle, URANIUM_SMUGGLE_MIN_COST, URANIUM_SMUGGLE_MAX_COST} from '../cards/blackmarket/UraniumSmuggle';
import {
  BootlegTerraformingFormula,
  BOOTLEG_TERRAFORMING_FORMULA_MIN_COST,
  BOOTLEG_TERRAFORMING_FORMULA_MAX_COST,
} from '../cards/blackmarket/BootlegTerraformingFormula';
import {RogueAiContract, ROGUE_AI_CONTRACT_MIN_COST, ROGUE_AI_CONTRACT_MAX_COST} from '../cards/blackmarket/RogueAiContract';
import {BlackMarketData, BLACK_MARKET_SLOT_COUNT, SerializedBlackMarketData} from './BlackMarketData';
import {Units} from '../../common/Units';

const UNIT_LABELS: Record<keyof Units, string> = {
  megacredits: 'M€',
  steel: 'steel',
  titanium: 'titanium',
  plants: 'plant',
  energy: 'energy',
  heat: 'heat',
};

/**
 * Black Market: a persistent 5-slot market of bespoke project cards, bought directly for a
 * fixed or once-rolled price (no bidding, no mutation/infection layering -- see
 * MutationMarkets for that). See CardName.ts's Black Market comment and
 * BlackMarketCardManifest.ts's doc comment for how "replayable" (buying the same design more
 * than once) is made safe without touching the shared project deck.
 */
export class BlackMarket {
  private constructor() {}

  public static initialize(game: IGame): BlackMarketData {
    const drawPile: Array<CardName> = [];
    for (const printings of BLACK_MARKET_PRINTINGS) {
      const factory = BLACKMARKET_CARD_MANIFEST.projectCards[printings[0]];
      if (factory !== undefined && !isCompatibleWith(factory, game.gameOptions)) {
        continue;
      }
      drawPile.push(...printings);
    }
    inplaceShuffle(drawPile, game.rng);

    const data: BlackMarketData = {
      slots: new Array(BLACK_MARKET_SLOT_COUNT).fill(undefined),
      drawPile,
    };
    for (let i = 0; i < BLACK_MARKET_SLOT_COUNT; i++) {
      data.slots[i] = BlackMarket.dealSlot(game, data);
    }
    return data;
  }

  /**
   * Buys the card at `slotIndex` for `player`: `player.playCard` enforces and deducts both
   * the M€ `cost` and the non-M€ `reserveUnits` bundle (no substitution, entirely via the
   * normal play pipeline -- see Card.ts's `play()`), resolves the card's behavior, and adds
   * it to the player's tableau. The slot is immediately refilled.
   */
  public static buy(game: IGame, player: IPlayer, slotIndex: number): void {
    const data = BlackMarket.dataOrThrow(game);
    const card = data.slots[slotIndex];
    if (card === undefined) {
      throw new Error(`No Black Market card at slot ${slotIndex}`);
    }
    player.playCard(card);
    data.slots[slotIndex] = BlackMarket.dealSlot(game, data);
  }

  private static dealSlot(game: IGame, data: BlackMarketData): IProjectCard | undefined {
    const name = data.drawPile.pop();
    if (name === undefined) {
      return undefined;
    }
    return BlackMarket.buildCard(name, game);
  }

  /**
   * Constructs the printing named `name`. Every design is constructible via the normal
   * manifest factory (`newProjectCard`), which is all that's needed for fixed-price designs
   * (and for reconstructing any design on game reload -- see the variable-cost classes' own
   * doc comments for why that resets a rolled price to its default). The 3 variable-cost
   * designs additionally get a fresh roll here, at the moment they're actually dealt.
   */
  private static buildCard(name: CardName, game: IGame): IProjectCard {
    switch (name) {
    case CardName.URANIUM_SMUGGLE:
    case CardName.URANIUM_SMUGGLE_II:
    case CardName.URANIUM_SMUGGLE_III:
      return new UraniumSmuggle(name, URANIUM_SMUGGLE_MIN_COST + game.rng.nextInt(URANIUM_SMUGGLE_MAX_COST - URANIUM_SMUGGLE_MIN_COST + 1));
    case CardName.BOOTLEG_TERRAFORMING_FORMULA:
    case CardName.BOOTLEG_TERRAFORMING_FORMULA_II:
    case CardName.BOOTLEG_TERRAFORMING_FORMULA_III:
      return new BootlegTerraformingFormula(
        name, BOOTLEG_TERRAFORMING_FORMULA_MIN_COST + game.rng.nextInt(BOOTLEG_TERRAFORMING_FORMULA_MAX_COST - BOOTLEG_TERRAFORMING_FORMULA_MIN_COST + 1));
    case CardName.ROGUE_AI_CONTRACT:
    case CardName.ROGUE_AI_CONTRACT_II:
    case CardName.ROGUE_AI_CONTRACT_III:
      return new RogueAiContract(name, ROGUE_AI_CONTRACT_MIN_COST + game.rng.nextInt(ROGUE_AI_CONTRACT_MAX_COST - ROGUE_AI_CONTRACT_MIN_COST + 1));
    default: {
      const card = newProjectCard(name);
      if (card === undefined) {
        throw new Error(`Unknown Black Market card ${name}`);
      }
      return card;
    }
    }
  }

  /** A short, human-readable price label for `card`, e.g. "2 titanium" or "2 M€, 1 heat". */
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
      slots: data.slots.map((card) => card?.name),
      drawPile: data.drawPile,
    };
  }

  public static deserialize(data: SerializedBlackMarketData | undefined): BlackMarketData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {
      slots: data.slots.map((name) => BlackMarket.deserializeSlot(name)),
      drawPile: data.drawPile,
    };
  }

  private static deserializeSlot(name: CardName | undefined): IProjectCard | undefined {
    if (name === undefined) {
      return undefined;
    }
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Unknown Black Market project card ${name}`);
    }
    return card;
  }
}
