import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class SpaceOffice extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SPACE_OFFICE,
      tags: [Tag.SPACE],
      cost: 25,
      victoryPoints: 2,

      metadata: {
        cardNumber: 'T07',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a space tag, draw a card.', (eb) => {
            eb.tag(Tag.SPACE).startEffect.cards(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const spaceTags = player.tags.cardTagCount(card, Tag.SPACE);
    if (spaceTags > 0) {
      player.drawCard(spaceTags);
    }
  }
}
