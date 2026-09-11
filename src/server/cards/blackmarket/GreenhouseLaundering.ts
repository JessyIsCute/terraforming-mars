import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big plant-to-mineral conversion for a terraforming-heavy economy catching up on mining late. */
export class GreenhouseLaundering extends Card implements IProjectCard {
  constructor(name: CardName = CardName.GREENHOUSE_LAUNDERING, plants: number = 6, steel: number = 8) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING],
      cost: 0,
      reserveUnits: {plants},
      victoryPoints: -2,

      behavior: {
        stock: {steel},
      },

      metadata: {
        cardNumber: 'BM21',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(plants, {digit}).plainText(`Spend ${plants} plants.`, /** parens */ true).br;
          b.steel(steel);
        }),
        description: `Spend ${plants} plants. Gain ${steel} steel.`,
      },
    });
  }
}

export class GreenhouseLaunderingII extends GreenhouseLaundering {
  constructor() {
    super(CardName.GREENHOUSE_LAUNDERING_II, 7, 9);
  }
}

export class GreenhouseLaunderingIII extends GreenhouseLaundering {
  constructor() {
    super(CardName.GREENHOUSE_LAUNDERING_III, 8, 10);
  }
}
