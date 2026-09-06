import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';

/** Turns the shared Delta Project prelude action into an all-or-nothing "collect
 * everything" button for its owner - at the price of an extra toll (1 unit of any standard
 * resource, their choice) on every use, and of being the corp most exposed to its own
 * passive if it falls behind. See DeltaProjectExpansion.buildAdvanceInput, .advance, and
 * .applyZetaTollkeeperGenerationStart for the logic. */
export class ZetaTollkeeper extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ZETA_TOLLKEEPER,
      tags: [],
      startingMegaCredits: 72,

      behavior: {
        production: {megacredits: -3},
      },

      metadata: {
        cardNumber: 'DP13',
        description: 'You start with 72 M€ and -3 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(72).nbsp.production((pb) => pb.minus().megacredits(3)).br;
          b.corpBox('effect', (eb) => {
            eb.effect('When doing the Delta Project action, it costs 1 additional standard resource of your choice - but you gain the reward of every earlier step too, not just the one you land on.', (e1) => {
              e1.wild(1).startEffect.plate('Delta track').asterix();
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
