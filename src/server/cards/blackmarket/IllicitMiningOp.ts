import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class IllicitMiningOp extends Card implements IProjectCard {
  constructor(name: CardName = CardName.ILLICIT_MINING_OP, energy: number = 2) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING],
      cost: 0,
      reserveUnits: {energy},
      victoryPoints: -1,

      behavior: {
        stock: {steel: 3},
      },

      metadata: {
        cardNumber: 'BM11',
        renderData: CardRenderer.builder((b) => {
          b.minus().energy(energy, {digit}).plainText(`Spend ${energy} energy.`, /** parens */ true).br;
          b.steel(3);
        }),
        description: `Spend ${energy} energy. Gain 3 steel.`,
      },
    });
  }
}

export class IllicitMiningOpII extends IllicitMiningOp {
  constructor() {
    super(CardName.ILLICIT_MINING_OP_II, 3);
  }
}

export class IllicitMiningOpIII extends IllicitMiningOp {
  constructor() {
    super(CardName.ILLICIT_MINING_OP_III, 4);
  }
}
