import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

/** A Neptune-moon biotech outfit: turns Jovian-tag research into microbes, and microbes into cash. */
export class NereidBiotech extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEREID_BIOTECH,
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
            ce.effect('When you play a card with a Jovian tag, including this, add 1 microbe to any card.', (eb) => {
              eb.tag(Tag.JOVIAN).startEffect.resource(CardResource.MICROBE).asterix();
            });
            ce.effect('When you add a microbe to a card, gain 1 M€.', (eb) => {
              eb.resource(CardResource.MICROBE).startEffect.megacredits(1);
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
      player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: jovianTags}));
    }
  }

  public onResourceAdded(player: IPlayer, card: ICard, count: number) {
    if (card.resourceType === CardResource.MICROBE) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true});
    }
  }
}
