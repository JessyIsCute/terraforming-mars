import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): mineral surplus buys into heat production. */
export class MeltdownContract extends Card implements IProjectCard {
  constructor(name: CardName = CardName.MELTDOWN_CONTRACT, cost: number = 0) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost,
      reserveUnits: {titanium: 2},
      victoryPoints: -1,

      behavior: {
        production: {heat: 3},
      },

      metadata: {
        cardNumber: 'BM14',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(2, {digit}).plainText('Spend 2 titanium.', /** parens */ true).br;
          b.production((pb) => pb.heat(3));
        }),
        description: 'Spend 2 titanium. Raise your heat production 3 steps (an unlicensed reactor conversion, no permits required).',
      },
    });
  }
}

export class MeltdownContractII extends MeltdownContract {
  constructor() {
    super(CardName.MELTDOWN_CONTRACT_II, 1);
  }
}

export class MeltdownContractIII extends MeltdownContract {
  constructor() {
    super(CardName.MELTDOWN_CONTRACT_III, 2);
  }
}
