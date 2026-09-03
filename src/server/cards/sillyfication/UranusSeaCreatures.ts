import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class UranusSeaCreatures extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.URANUS_SEA_CREATURES,
      tags: [Tag.ANIMAL, Tag.JOVIAN],
      cost: 12,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      requirements: {tag: Tag.JOVIAN, count: 3},

      metadata: {
        cardNumber: 'X41',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Jovian tag, including this, add 1 animal to this card.', (eb) => {
            eb.tag(Tag.JOVIAN).startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP per animal on this card.');
        }),
        description: 'Requires 3 Jovian tags.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard): void {
    const qty = player.tags.cardTagCount(card, Tag.JOVIAN);
    if (qty > 0) {
      player.addResourceTo(this, {qty, log: true});
    }
  }

  public onNonCardTagAdded(player: IPlayer, tag: Tag): void {
    if (tag === Tag.JOVIAN) {
      player.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
