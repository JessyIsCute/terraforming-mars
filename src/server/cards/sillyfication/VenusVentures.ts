import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard, ICard} from '../ICard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class VenusVentures extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.VENUS_VENTURES,
      tags: [Tag.VENUS, Tag.VENUS],
      startingMegaCredits: 48,
      resourceType: CardResource.FLOATER,

      metadata: {
        cardNumber: 'XC2',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48);
          b.corpBox('effect-action', (cea) => {
            cea.vSpace(Size.MEDIUM);
            cea.effect('When you play a Venus tag, including this, add 2 floaters to any card.', (eb) => {
              eb.tag(Tag.VENUS).startEffect.resource(CardResource.FLOATER, {amount: 2}).asterix();
            });
            cea.action('Remove any number of floaters from this card to gain 2 M€ each.', (ab) => {
              ab.text('x').resource(CardResource.FLOATER).startAction.megacredits(2, {size: Size.SMALL, text: '2X'});
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    // Triggers once per Venus tag on the card, so this corp's own two Venus tags
    // hand you 4 floaters when it comes into play.
    const venusTags = player.tags.cardTagCount(card, Tag.VENUS);
    if (venusTags > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: venusTags * 2}));
    }
  }

  public canAct(): boolean {
    return this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Remove floaters to gain 2 M€ each', 'Remove floaters', 1, this.resourceCount, true)
      .andThen((amount) => {
        player.removeResourceFrom(this, amount, {log: false});
        const gained = 2 * amount;
        player.stock.add(Resource.MEGACREDITS, gained, {log: false});
        player.game.log('${0} removed ${1} floaters from ${2} to gain ${3} M€',
          (b) => b.player(player).number(amount).card(this).number(gained));
        return undefined;
      });
  }
}
