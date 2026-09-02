import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class MicroCredits extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MICRO_CREDITS,
      cost: 3,
      tags: [Tag.EARTH, Tag.BUILDING],

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'X01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1));
        }),
        description: 'Increase your MC production 1 step.',
      },
    });
  }
}