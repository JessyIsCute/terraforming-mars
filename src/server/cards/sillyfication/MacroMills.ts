import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class MacroMills extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MACRO_MILLS,
      cost: 6,

      behavior: {
        production: {heat: 2},
      },

      metadata: {
        cardNumber: 'X05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2));
        }),
        description: 'Increase your heat production 2 steps.',
      },
    });
  }
}
