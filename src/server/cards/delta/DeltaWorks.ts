import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../IProjectCard';

export class DeltaWorks extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.DELTA_WORKS,
      tags: [Tag.BUILDING],
      cost: 4,

      metadata: {
        cardNumber: 'DP05',
        renderData: CardRenderer.builder((b) => {
          b.steel(1).equals().energy(1);
        }),
        description: 'When doing the Delta Project action, you may use steel as energy.',
      },
    });
  }

  // Behavior in DeltaProjectExpansion.availableEnergyForDelta / deductEnergyForDelta.
}
