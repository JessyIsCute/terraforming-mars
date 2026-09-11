import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): a knockoff energy-production card -- cheaper materials than Smuggled Reactor Core, but only half the production. */
export class BootlegBattery extends Card implements IProjectCard {
  constructor(name: CardName = CardName.BOOTLEG_BATTERY, cost: number = 1) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost,
      reserveUnits: {steel: 2},
      victoryPoints: -1,

      behavior: {
        production: {energy: 1},
      },

      metadata: {
        cardNumber: 'BM38',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(2, {digit}).plainText('Spend 2 steel.', /** parens */ true).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Spend 2 steel. Raise your energy production 1 step (a reactor core that fell off the back of a truck).',
      },
    });
  }
}

export class BootlegBatteryII extends BootlegBattery {
  constructor() {
    super(CardName.BOOTLEG_BATTERY_II, 2);
  }
}

export class BootlegBatteryIII extends BootlegBattery {
  constructor() {
    super(CardName.BOOTLEG_BATTERY_III, 3);
  }
}
