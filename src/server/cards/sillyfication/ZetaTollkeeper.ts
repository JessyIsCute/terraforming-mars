import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';

/** Turns the shared Delta Project prelude action into an all-or-nothing "collect
 * everything" button for its owner - at the price of a flat energy surcharge on every
 * use, and of being the corp most exposed to its own passive if it falls behind. See
 * DeltaProjectExpansion.advance and .applyZetaTollkeeperGenerationStart for the logic. */
export class ZetaTollkeeper extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ZETA_TOLLKEEPER,
      tags: [],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'DP13',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).br;
          b.corpBox('effect', (eb) => {
            eb.effect('When doing the Delta Project action, it costs 1 additional energy - but you gain the reward of every earlier step too, not just the one you land on.', (e1) => {
              e1.energy(1).startEffect.plate('Delta track').asterix();
            });
            eb.br;
            eb.effect('At the start of each generation, whoever is furthest along the Delta Project track moves back 1 step and gains nothing for it - unless that is you, in which case you gain every step\'s reward up to your new position instead.', (e2) => {
              e2.empty().startEffect.plate('Delta track').minus();
            });
          });
        }),
      },
    });
  }
}
