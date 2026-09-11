import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big lump-sum heat-to-M€ conversion -- distinct from Geothermal Kickback's smaller M€ *production* by paying out a one-time windfall instead. */
export class VentTapSyndicate extends Card implements IProjectCard {
  constructor(name: CardName = CardName.VENT_TAP_SYNDICATE, heat: number = 4) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost: 0,
      reserveUnits: {heat},
      victoryPoints: -2,

      behavior: {
        stock: {megacredits: 14},
      },

      metadata: {
        cardNumber: 'BM22',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(heat, {digit}).plainText(`Spend ${heat} heat.`, /** parens */ true).br;
          b.megacredits(14);
        }),
        description: `Spend ${heat} heat. Gain 14 M€.`,
      },
    });
  }
}

export class VentTapSyndicateII extends VentTapSyndicate {
  constructor() {
    super(CardName.VENT_TAP_SYNDICATE_II, 5);
  }
}

export class VentTapSyndicateIII extends VentTapSyndicate {
  constructor() {
    super(CardName.VENT_TAP_SYNDICATE_III, 6);
  }
}
