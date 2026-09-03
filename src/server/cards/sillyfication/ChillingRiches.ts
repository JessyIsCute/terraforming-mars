import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class ChillingRiches extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CHILLING_RICHES,
      tags: [Tag.BUILDING],
      cost: 24,

      behavior: {
        production: {heat: -2, megacredits: 7},
      },

      metadata: {
        cardNumber: 'X44',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().heat(2).nbsp.plus().megacredits(7, {digit}));
        }),
        description: 'Decrease your heat production 2 steps. Increase your M€ production 7 steps.',
      },
    });
  }
}
