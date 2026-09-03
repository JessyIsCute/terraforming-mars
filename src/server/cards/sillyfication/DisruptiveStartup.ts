import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';
import {IProjectCard} from '../IProjectCard';

export class DisruptiveStartup extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.DISRUPTIVE_STARTUP,
      tags: [Tag.SCIENCE, Tag.EARTH],
      cost: 11,
      victoryPoints: -1,

      action: {
        spend: {cards: 1},
        stock: {megacredits: 4},
      },

      metadata: {
        cardNumber: 'X13',
        renderData: CardRenderer.builder((b) => {
          b.action('Discard a card to gain 4 M€.', (eb) => {
            eb.cards(1).startAction.megacredits(4);
          });
        }),
        description: 'Move fast, break things.',
      },
    });
  }
}
