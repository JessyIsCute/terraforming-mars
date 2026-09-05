import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class DevelopmentManager extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.DEVELOPMENT_MANAGER,
      tags: [Tag.BUILDING],
      cost: 8,

      metadata: {
        cardNumber: 'DP06',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.wild(1)).nbsp.text('2+', {size: Size.SMALL}).slash().plate('Delta track').nbsp.text('2+', {size: Size.SMALL}).colon().megacredits(2);
        }),
        description: 'Each time you increase a type of production 2 or more steps, or advance 2 or more steps on the Delta Project track, gain 2 M€.',
      },
    });
  }

  private gain(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
  }

  public onProductionGain(player: IPlayer, _resource: Resource, amount: number) {
    if (amount >= 2) {
      this.gain(player);
    }
  }

  public onDeltaTrackMoved(cardOwner: IPlayer, mover: IPlayer, steps: number, forward: boolean) {
    if (cardOwner === mover && forward && steps >= 2) {
      this.gain(cardOwner);
    }
  }
}
