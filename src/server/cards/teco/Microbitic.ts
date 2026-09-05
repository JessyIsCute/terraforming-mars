import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Microbitic extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MICROBITIC,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      cost: 12,

      behavior: {
        spend: {plants: 4},
        production: {plants: 2},
      },

      metadata: {
        cardNumber: 'T32',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).br;
          b.minus().plants(4);
        }),
        description: 'Lose 4 plants. Increase your plant production 2 steps.',
      },
    });
  }
}
