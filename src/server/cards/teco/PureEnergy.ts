import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class PureEnergy extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PURE_ENERGY,
      tags: [Tag.POWER],
      cost: 35,
      victoryPoints: 1,

      behavior: {
        production: {energy: 7},
      },

      metadata: {
        cardNumber: 'T27',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Power tag, you pay 1 M€ less for each Power tag you have.', (eb) => {
            eb.tag(Tag.POWER).startEffect.megacredits(1).slash().tag(Tag.POWER);
          }).br;
          b.production((pb) => pb.energy(7));
        }),
      },
    });
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard): number {
    if (!card.tags.includes(Tag.POWER)) {
      return 0;
    }
    return player.tags.count(Tag.POWER);
  }
}
