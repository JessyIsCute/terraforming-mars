import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class ExcessWater extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.EXCESS_WATER,
      tags: [],
      cost: 8,

      metadata: {
        cardNumber: 'CB27',
        renderData: CardRenderer.builder((b) => {
          b.text('Your bonus for placing adjacent to oceans is 2 M€ more.', {size: Size.SMALL});
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus += 2;
    return undefined;
  }

  public override bespokeOnDiscard(player: IPlayer) {
    player.oceanBonus -= 2;
  }
}
