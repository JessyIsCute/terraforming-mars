import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardRenderer} from '../render/CardRenderer';

/** Mid-game tier (unlocks generation 4+): a repeatable illegal trade in black-market microbe cultures. */
export class BiopiracyRing extends ActionCard implements IProjectCard {
  constructor(name: CardName = CardName.BIOPIRACY_RING, cost: number = 5) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.MICROBE],
      cost,
      victoryPoints: -1,

      action: {
        spend: {plants: 1},
        stock: {megacredits: 5},
      },

      metadata: {
        cardNumber: 'BM27',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 plant to gain 5 M€.',
            (eb) => eb.startAction.plants(1).arrow().megacredits(5));
        }),
        description: 'Spend 1 plant to gain 5 M€ (sell black-market microbe cultures to desperate colonies).',
      },
    });
  }
}

export class BiopiracyRingII extends BiopiracyRing {
  constructor() {
    super(CardName.BIOPIRACY_RING_II, 6);
  }
}

export class BiopiracyRingIII extends BiopiracyRing {
  constructor() {
    super(CardName.BIOPIRACY_RING_III, 7);
  }
}
