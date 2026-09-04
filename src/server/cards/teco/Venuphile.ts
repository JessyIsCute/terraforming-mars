import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Venuphile extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUPHILE,
      tags: [Tag.VENUS],
      cost: 18,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'T03',
        renderData: CardRenderer.builder((b) => {
          b.effect('Venus cards cost 1 M€ less for each Venus tag you have.', (eb) => {
            eb.tag(Tag.VENUS).startEffect.megacredits(-1);
          });
        }),
      },
    });
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard): number {
    if (!card.tags.includes(Tag.VENUS)) {
      return 0;
    }
    return player.tags.count(Tag.VENUS);
  }
}
