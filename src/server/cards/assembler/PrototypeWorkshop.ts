import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class PrototypeWorkshop extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PROTOTYPE_WORKSHOP,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 9,

      behavior: {
        assemble: {count: 2, into: 'hand'},
        stock: {steel: 1},
      },

      metadata: {
        cardNumber: 'AS02',
        renderData: CardRenderer.builder((b) => {
          b.assemble(2).nbsp.steel(1);
        }),
        description: 'Assemble 2 new cards into your hand. Gain 1 steel.',
      },
    });
  }
}
