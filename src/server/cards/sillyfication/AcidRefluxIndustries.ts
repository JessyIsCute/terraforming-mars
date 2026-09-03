import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard, ICard} from '../ICard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class AcidRefluxIndustries extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.ACID_REFLUX_INDUSTRIES,
      tags: [Tag.VENUS, Tag.VENUS],
      startingMegaCredits: 54,
      resourceType: CardResource.FLOATER,

      metadata: {
        cardNumber: 'XC2',
        description: 'You start with 54 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(54);
          b.corpBox('effect-action', (cea) => {
            cea.effect('When you play a card, you pay 1 M€ more for it.', (eb) => {
              eb.cards(1).startEffect.plus().megacredits(1);
            });
            cea.effect('When you play a card with a Venus tag, including this, add 2 floaters to any card.', (eb) => {
              eb.tag(Tag.VENUS).asterix().startEffect.resource(CardResource.FLOATER, {amount: 2}).asterix();
            });
            cea.effect('When playing a Venus tag, floaters here may be used as payment, and are worth 3 M€ each.', (eb) => {
              eb.tag(Tag.VENUS).startEffect.resource(CardResource.FLOATER).equals().megacredits(3);
            });
            cea.action('Remove any number of floaters from this card to gain 2 M€ each.', (ab) => {
              ab.text('x').resource(CardResource.FLOATER).startAction.megacredits(2, {size: Size.SMALL, text: '2x'});
            });
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
