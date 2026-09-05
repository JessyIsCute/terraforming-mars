import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Electrobic extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ELECTROBIC,
      tags: [Tag.MICROBE, Tag.POWER],
      cost: 4,

      behavior: {
        spend: {plants: 4},
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'T30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).br;
          b.minus().plants(4);
        }),
        description: 'Lose 4 plants. Increase your energy production 2 steps.',
      },
    });
  }
}
