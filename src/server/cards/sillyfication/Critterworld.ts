import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard, ICard} from '../ICard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all, digit} from '../Options';

export class Critterworld extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.CRITTERWORLD,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 36,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 4},
      initialActionText: 'Draw 2 cards with an animal tag',

      behavior: {
        addResources: 8,
      },

      metadata: {
        cardNumber: 'XC3',
        description: 'You start with 36 M€ and add 8 animals to this card. As your first action, draw 2 cards with an animal tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).nbsp.resource(CardResource.ANIMAL, {amount: 8, digit}).nbsp.cards(2, {secondaryTag: Tag.ANIMAL});
          b.corpBox('effect-action', (cea) => {
            cea.vSpace(Size.MEDIUM);
            cea.effect('When you add an animal to another card, add an animal to this card.', (eb) => {
              eb.resource(CardResource.ANIMAL, {all}).asterix().startEffect.resource(CardResource.ANIMAL);
            });
            cea.action('Remove 1 animal from any of your cards to gain 1 M€ for every 2 animals on this card.', (ab) => {
              ab.resource(CardResource.ANIMAL).startAction.megacredits(1).slash().resource(CardResource.ANIMAL, {amount: 2});
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(2, {include: (card) => card.tags.includes(Tag.ANIMAL)});
    return undefined;
  }

  public onResourceAdded(player: IPlayer, card: ICard, count: number) {
    if (card.name !== this.name && card.resourceType === CardResource.ANIMAL) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }

  public canAct(player: IPlayer): boolean {
    return player.getCardsWithResources(CardResource.ANIMAL).length > 0;
  }

  public action(player: IPlayer) {
    const gain = Math.floor(this.resourceCount / 2);
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {source: 'self', blockable: false, log: true}))
      .andThen(() => {
        player.stock.add(Resource.MEGACREDITS, gain, {log: true});
        return undefined;
      });
    return undefined;
  }
}
