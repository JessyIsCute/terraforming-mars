import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): mineral surplus buys card advantage. */
export class HeavyMetalHustle extends Card implements IProjectCard {
  constructor(name: CardName = CardName.HEAVY_METAL_HUSTLE, titanium: number = 3) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 0,
      reserveUnits: {titanium},
      victoryPoints: -1,

      behavior: {
        drawCard: 2,
      },

      metadata: {
        cardNumber: 'BM18',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(titanium, {digit}).plainText(`Spend ${titanium} titanium.`, /** parens */ true).br;
          b.cards(2);
        }),
        description: `Spend ${titanium} titanium. Draw 2 cards (sell refined ore for insider research).`,
      },
    });
  }
}

export class HeavyMetalHustleII extends HeavyMetalHustle {
  constructor() {
    super(CardName.HEAVY_METAL_HUSTLE_II, 4);
  }
}

export class HeavyMetalHustleIII extends HeavyMetalHustle {
  constructor() {
    super(CardName.HEAVY_METAL_HUSTLE_III, 5);
  }
}
