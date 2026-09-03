import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {ICard} from '../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {digit} from '../Options';

export class AcidRefluxIndustries extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ACID_REFLUX_INDUSTRIES,
      tags: [Tag.VENUS, Tag.VENUS],
      startingMegaCredits: 54,
      resourceType: CardResource.FLOATER,

      action: {
        spend: {resourcesHere: 1},
        stock: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'XC2',
        description: 'You start with 54 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(54).br;
          b.effect('When you play a card, you pay 1 M€ more for it.', (eb) => {
            eb.cards(1).startEffect.plus().megacredits(1);
          }).br;
          b.effect('Whenever you play a card with a Venus tag, including this, add 2 floaters to any card.', (eb) => {
            eb.tag(Tag.VENUS).asterix().startEffect.resource(CardResource.FLOATER, {amount: 2}).asterix();
          }).br;
          b.action('Remove 1 floater from this card to gain 2 M€.', (ab) => {
            ab.resource(CardResource.FLOATER).startAction.megacredits(2, {digit});
          });
        }),
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, _card: IProjectCard): number {
    return -1;
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 2}));
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name !== this.name && card.tags.includes(Tag.VENUS)) {
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 2}));
    }
  }
}
