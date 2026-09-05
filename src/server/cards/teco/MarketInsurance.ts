import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class MarketInsurance extends Card implements IProjectCard {
  /** Whether this player's M€ production has been decreased since the last production phase. */
  public data: boolean = false;

  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARKET_INSURANCE,
      tags: [Tag.EARTH],
      cost: 10,

      metadata: {
        cardNumber: 'T23',
        renderData: CardRenderer.builder((b) => {
          b.effect('At production, if your M€ production was decreased this generation, gain 5 M€ production. Otherwise, gain 2 M€ production.', (eb) => {
            eb.production((pb) => pb.megacredits(-1)).startEffect.production((pb) => pb.megacredits(5));
          });
        }),
        description: 'At production, gain 5 M€ production if your M€ production was decreased this generation, otherwise gain 2 M€ production.',
      },
    });
  }

  public onProductionGain(_player: IPlayer, resource: Resource, amount: number) {
    if (resource === Resource.MEGACREDITS && amount < 0) {
      this.data = true;
    }
  }

  public onProductionPhase(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, this.data ? 5 : 2, {log: true});
    this.data = false;
  }
}
