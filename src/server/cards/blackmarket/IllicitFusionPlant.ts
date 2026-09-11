import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big heat-to-energy-production conversion. */
export class IllicitFusionPlant extends Card implements IProjectCard {
  constructor(name: CardName = CardName.ILLICIT_FUSION_PLANT, heat: number = 5) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 0,
      reserveUnits: {heat},
      victoryPoints: -2,

      behavior: {
        production: {energy: 3},
      },

      metadata: {
        cardNumber: 'BM40',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(heat, {digit}).plainText(`Spend ${heat} heat.`, /** parens */ true).br;
          b.production((pb) => pb.energy(3));
        }),
        description: `Spend ${heat} heat. Raise your energy production 3 steps (an unlicensed fusion core, running hotter than it should).`,
      },
    });
  }
}

export class IllicitFusionPlantII extends IllicitFusionPlant {
  constructor() {
    super(CardName.ILLICIT_FUSION_PLANT_II, 6);
  }
}
