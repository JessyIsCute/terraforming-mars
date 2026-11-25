import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class ModularFactory extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MODULAR_FACTORY,
      tags: [Tag.BUILDING],
      cost: 13,
      victoryPoints: 1,

      behavior: {
        production: {steel: 1},
        assemble: {count: 1, into: 'hand'},
      },

      metadata: {
        cardNumber: 'AS04',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1)).nbsp.assemble(1);
        }),
        description: 'Increase your steel production 1 step. Assemble a new card into your hand.',
      },
    });
  }
}
