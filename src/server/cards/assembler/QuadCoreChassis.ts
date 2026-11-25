import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class QuadCoreChassis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.QUAD_CORE_CHASSIS,
      tags: [Tag.BUILDING],
      cost: 5,

      behavior: {
        assemble: {count: 1, into: 'hand', preset: {tagCount: 4}},
      },

      metadata: {
        cardNumber: 'AS07',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1).text('4').tag(Tag.WILD).asterix();
        }),
        description: 'Assemble a new card with exactly 4 tags into your hand.',
      },
    });
  }
}
