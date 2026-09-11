import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a dual-reward mineral-to-heat-and-plants conversion. */
export class CartelRefinery extends Card implements IProjectCard {
  constructor(name: CardName = CardName.CARTEL_REFINERY, cost: number = 1, steel: number = 3) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost,
      reserveUnits: {steel},
      victoryPoints: -2,

      behavior: {
        production: {heat: 3},
        stock: {plants: 3},
      },

      metadata: {
        cardNumber: 'BM19',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(steel, {digit}).plainText(`Spend ${steel} steel.`, /** parens */ true).br;
          b.production((pb) => pb.heat(3)).nbsp.plants(3);
        }),
        description: `Spend ${steel} steel. Raise your heat production 3 steps and gain 3 plants.`,
      },
    });
  }
}

export class CartelRefineryII extends CartelRefinery {
  constructor() {
    super(CardName.CARTEL_REFINERY_II, 2, 4);
  }
}
