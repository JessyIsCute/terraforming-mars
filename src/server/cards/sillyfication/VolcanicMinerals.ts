import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class VolcanicMinerals extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.VOLCANIC_MINERALS,
      cost: 3,

      behavior: {
        spend: {heat: 4},
        or: {
          behaviors: [
            {stock: {titanium: 4}, title: 'Gain 4 titanium'},
            {stock: {steel: 6}, title: 'Gain 6 steel'},
          ],
        },
      },

      metadata: {
        cardNumber: 'X04',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(4, {digit}).arrow().titanium(4, {digit}).or().steel(6, {digit});
        }),
        description: 'Spend 4 heat to gain either 4 titanium or 6 steel.',
      },
    });
  }
}
