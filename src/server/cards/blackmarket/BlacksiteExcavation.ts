import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big mineral-to-plant-and-heat-production double conversion. */
export class BlacksiteExcavation extends Card implements IProjectCard {
  constructor(name: CardName = CardName.BLACKSITE_EXCAVATION, titanium: number = 5) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.PLANT],
      cost: 0,
      reserveUnits: {titanium},
      victoryPoints: -2,

      behavior: {
        production: {plants: 2, heat: 2},
      },

      metadata: {
        cardNumber: 'BM20',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(titanium, {digit}).plainText(`Spend ${titanium} titanium.`, /** parens */ true).br;
          b.production((pb) => pb.plants(2).nbsp.heat(2));
        }),
        description: `Spend ${titanium} titanium. Raise your plant production 2 steps and heat production 2 steps.`,
      },
    });
  }
}

export class BlacksiteExcavationII extends BlacksiteExcavation {
  constructor() {
    super(CardName.BLACKSITE_EXCAVATION_II, 6);
  }
}

export class BlacksiteExcavationIII extends BlacksiteExcavation {
  constructor() {
    super(CardName.BLACKSITE_EXCAVATION_III, 7);
  }
}
