import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

/**
 * Printed as a blue (Active-style) card but its rules text is a passive, continuous discount
 * with no player-triggered repeatable action -- the same situation as the official card Splice's
 * discount effect, which is Automated. Classified AUTOMATED per the batch spec's guidance.
 */
export class MicrobioticOceanicFauna extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MICROBIOTIC_OCEANIC_FAUNA,
      tags: [Tag.MICROBE],
      cost: 7,

      requirements: {oceans: 3},
      cardDiscount: {tag: Tag.MICROBE, amount: 3},

      metadata: {
        cardNumber: 'H49',
        renderData: CardRenderer.builder((b) => {
          b.effect('Cards with a microbe tag cost 3 M€ less.', (eb) => {
            eb.tag(Tag.MICROBE).startEffect.megacredits(-3);
          });
        }),
        description: 'Requires 3 ocean tiles.',
      },
    });
  }
}
