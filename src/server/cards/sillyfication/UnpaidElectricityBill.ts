import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {digit} from '../Options';

export class UnpaidElectricityBill extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.UNPAID_ELECTRICITY_BILL,
      tags: [Tag.POWER],
      cost: 3,

      behavior: {
        production: {energy: -1},
        stock: {megacredits: 9},
      },

      metadata: {
        cardNumber: 'X14',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(9, {digit}).production((pb) => pb.minus().energy(1));
        }),
        description: 'Gain 9 M€. Decrease your energy production 1 step. Future you can deal with it.',
      },
    });
  }
}
