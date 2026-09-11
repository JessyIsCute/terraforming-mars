import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardRenderer} from '../render/CardRenderer';

/** Mid-game tier (unlocks generation 4+): a repeatable illegal shakedown of outer-belt shipping lanes. */
export class OuterSystemRacketeering extends ActionCard implements IProjectCard {
  constructor(name: CardName = CardName.OUTER_SYSTEM_RACKETEERING, cost: number = 7) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.JOVIAN],
      cost,
      victoryPoints: -1,

      action: {
        spend: {energy: 2},
        stock: {megacredits: 5},
      },

      metadata: {
        cardNumber: 'BM26',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 energy to gain 5 M€.',
            (eb) => eb.startAction.energy(2).arrow().megacredits(5));
        }),
        description: 'Spend 2 energy to gain 5 M€ (shake down outer-belt shipping lanes).',
      },
    });
  }
}

export class OuterSystemRacketeeringII extends OuterSystemRacketeering {
  constructor() {
    super(CardName.OUTER_SYSTEM_RACKETEERING_II, 8);
  }
}

export class OuterSystemRacketeeringIII extends OuterSystemRacketeering {
  constructor() {
    super(CardName.OUTER_SYSTEM_RACKETEERING_III, 9);
  }
}
