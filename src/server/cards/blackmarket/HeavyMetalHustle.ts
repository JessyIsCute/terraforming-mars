import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): mineral surplus buys more minerals. */
export class HeavyMetalHustle extends Card implements IProjectCard {
  constructor(name: CardName = CardName.HEAVY_METAL_HUSTLE, titanium: number = 3, steel: number = 5) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.SPACE],
      cost: 0,
      reserveUnits: {titanium},
      victoryPoints: -1,

      behavior: {
        stock: {steel},
      },

      metadata: {
        cardNumber: 'BM18',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(titanium, {digit}).plainText(`Spend ${titanium} titanium.`, /** parens */ true).br;
          b.steel(steel);
        }),
        description: `Spend ${titanium} titanium. Gain ${steel} steel (sell refined ore for scrap-metal profit).`,
      },
    });
  }
}

export class HeavyMetalHustleII extends HeavyMetalHustle {
  constructor() {
    super(CardName.HEAVY_METAL_HUSTLE_II, 4, 6);
  }
}

export class HeavyMetalHustleIII extends HeavyMetalHustle {
  constructor() {
    super(CardName.HEAVY_METAL_HUSTLE_III, 5, 7);
  }
}
