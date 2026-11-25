import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class AssemblyLine extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ASSEMBLY_LINE,
      tags: [Tag.BUILDING],
      cost: 8,

      action: {
        spend: {megacredits: 1},
        assemble: {count: 1, into: 'hand'},
      },

      metadata: {
        cardNumber: 'AS01',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 M€ to Assemble a new card into your hand.', (eb) => {
            eb.megacredits(1).startAction.assemble(1);
          });
        }),
      },
    });
  }
}
