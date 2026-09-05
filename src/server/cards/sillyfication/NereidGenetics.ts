import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

/** A Neptune-moon genetics outfit: engineers Jovian organisms that are classified as microbes. */
export class NereidGenetics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEREID_GENETICS,
      tags: [Tag.JOVIAN, Tag.MICROBE],
      startingMegaCredits: 38,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 3},

      metadata: {
        cardNumber: 'XC4',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Your Jovian tags also count as microbe tags.', (eb) => {
              eb.tag(Tag.JOVIAN).startEffect.tag(Tag.MICROBE);
            });
            ce.effect('When you play a card with a Jovian tag, including this, add 2 microbes to any card.', (eb) => {
              eb.tag(Tag.JOVIAN).startEffect.resource(CardResource.MICROBE, {amount: 2}).asterix();
            });
          });
          b.vpText('1 VP per 3 microbes on this card.');
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const jovianTags = player.tags.cardTagCount(card, Tag.JOVIAN);
    if (jovianTags > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: jovianTags * 2}));
    }
  }
}
