import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class DeltaSurge extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.DELTA_SURGE,
      tags: [Tag.SCIENCE],
      cost: 22,

      behavior: {
        ocean: {},
      },

      metadata: {
        cardNumber: 'DP04',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1);
        }),
        description: 'Place an ocean tile. When advancing multiple steps on the Delta Project track at once, gain the reward for every step, not just the one you land on. Does not apply to the 2VP step.',
      },
    });
  }
}
