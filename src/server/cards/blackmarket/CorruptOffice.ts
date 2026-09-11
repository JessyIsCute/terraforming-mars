import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/** Mid-game tier (unlocks generation 4+): requires Underworld (registered with `compatibility: 'underworld'`) since it prints a Crime tag and discounts Crime tags -- mirrors VenusWaystation.ts's `cardDiscount` pattern. */
export class CorruptOffice extends Card implements IProjectCard {
  constructor(name: CardName = CardName.CORRUPT_OFFICE, cost: number = 8) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.CRIME],
      cost,
      victoryPoints: -1,

      cardDiscount: {tag: Tag.CRIME, amount: 2},

      metadata: {
        cardNumber: 'BM36',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Crime tag, you pay 2 M€ less for it.', (eb) => {
            eb.tag(Tag.CRIME).startEffect.megacredits(-2);
          });
        }),
        description: 'When you play a Crime tag, you pay 2 M€ less for it (bribe the right officials, look the other way).',
      },
    });
  }
}

export class CorruptOfficeII extends CorruptOffice {
  constructor() {
    super(CardName.CORRUPT_OFFICE_II, 9);
  }
}

export class CorruptOfficeIII extends CorruptOffice {
  constructor() {
    super(CardName.CORRUPT_OFFICE_III, 10);
  }
}
