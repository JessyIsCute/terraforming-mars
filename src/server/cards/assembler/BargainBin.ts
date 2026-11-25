import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class BargainBin extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BARGAIN_BIN,
      cost: 2,

      behavior: {
        assemble: {count: 1, into: 'hand', preset: {maxComplexity: 1, maxCost: 8}},
        stock: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'AS14',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1).text('≤8').asterix().nbsp.megacredits(2);
        }),
        description: 'Assemble a new simple card costing at most 8 M€ into your hand. Gain 2 M€.',
      },
    });
  }
}
