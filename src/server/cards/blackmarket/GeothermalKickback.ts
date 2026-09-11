import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): heat surplus buys into M€ production, helping a terraforming-focused economy catch up financially. */
export class GeothermalKickback extends Card implements IProjectCard {
  constructor(name: CardName = CardName.GEOTHERMAL_KICKBACK, heat: number = 2) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost: 0,
      reserveUnits: {heat},
      victoryPoints: -1,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'BM16',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(heat, {digit}).plainText(`Spend ${heat} heat.`, /** parens */ true).br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: `Spend ${heat} heat. Raise your M€ production 2 steps (skim the payout from a bootleg thermal vent).`,
      },
    });
  }
}

export class GeothermalKickbackII extends GeothermalKickback {
  constructor() {
    super(CardName.GEOTHERMAL_KICKBACK_II, 3);
  }
}

export class GeothermalKickbackIII extends GeothermalKickback {
  constructor() {
    super(CardName.GEOTHERMAL_KICKBACK_III, 4);
  }
}
