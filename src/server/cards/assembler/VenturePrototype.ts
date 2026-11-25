import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class VenturePrototype extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.VENTURE_PROTOTYPE,
      tags: [Tag.SPACE],
      cost: 6,

      behavior: {
        assemble: {count: 1, into: 'hand', preset: {complexity: 'high'}},
        stock: {titanium: 1},
      },

      metadata: {
        cardNumber: 'AS11',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1).text('high').asterix().nbsp.titanium(1);
        }),
        description: 'Assemble a new high-complexity card into your hand. Gain 1 titanium.',
      },
    });
  }
}
