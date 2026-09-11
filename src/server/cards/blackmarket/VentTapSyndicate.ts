import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big heat-to-M€-production conversion. */
export class VentTapSyndicate extends Card implements IProjectCard {
  constructor(name: CardName = CardName.VENT_TAP_SYNDICATE, heat: number = 7) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost: 0,
      reserveUnits: {heat},
      victoryPoints: -2,

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'BM22',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(heat, {digit}).plainText(`Spend ${heat} heat.`, /** parens */ true).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: `Spend ${heat} heat. Raise your M€ production 3 steps.`,
      },
    });
  }
}

export class VentTapSyndicateII extends VentTapSyndicate {
  constructor() {
    super(CardName.VENT_TAP_SYNDICATE_II, 8);
  }
}

export class VentTapSyndicateIII extends VentTapSyndicate {
  constructor() {
    super(CardName.VENT_TAP_SYNDICATE_III, 9);
  }
}
