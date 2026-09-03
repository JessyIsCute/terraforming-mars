import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class CallistoTimeshare extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CALLISTO_TIMESHARE,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 13,
      victoryPoints: 1,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'X16',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Increase your M€ production 2 steps.',
      },
    });
  }
}
