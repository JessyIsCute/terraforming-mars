import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';
import {digit} from '../Options';

export class ThermalSmeltery extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.THERMAL_SMELTERY,
      tags: [Tag.BUILDING],
      cost: 8,

      action: {
        spend: {heat: 7},
        stock: {titanium: 4},
      },

      metadata: {
        cardNumber: 'X29',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 7 heat to gain 4 titanium.', (eb) => {
            eb.heat(7, {digit}).startAction.titanium(4, {digit});
          });
        }),
      },
    });
  }
}
