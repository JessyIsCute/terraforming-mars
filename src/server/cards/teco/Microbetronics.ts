import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Microbetronics extends Card implements IProjectCard {
  /** Energy production steps already granted, so gains only apply to newly-crossed thresholds. */
  public data: number = 0;

  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MICROBETRONICS,
      tags: [Tag.MICROBE, Tag.POWER],
      cost: 7,
      resourceType: CardResource.MICROBE,

      metadata: {
        cardNumber: 'T31',
        renderData: CardRenderer.builder((b) => {
          b.effect('Gain 1 energy production for every 2 microbes you have on your cards, including this one.', (eb) => {
            eb.resource(CardResource.MICROBE, {amount: 2}).startEffect.production((pb) => pb.energy(1));
          });
        }),
      },
    });
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard) {
    if (playedCard.resourceType !== CardResource.MICROBE) {
      return;
    }
    const steps = Math.floor(player.getResourceCount(CardResource.MICROBE) / 2);
    if (steps > this.data) {
      player.production.add(Resource.ENERGY, steps - this.data, {log: true});
      this.data = steps;
    }
  }
}
