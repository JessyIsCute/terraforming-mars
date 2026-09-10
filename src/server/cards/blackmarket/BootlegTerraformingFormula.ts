import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export const BOOTLEG_TERRAFORMING_FORMULA_MIN_COST = 6;
export const BOOTLEG_TERRAFORMING_FORMULA_MAX_COST = 9;

/** Variable-cost design -- see UraniumSmuggle.ts's doc comment for why `cost` is an overridden getter. */
export class BootlegTerraformingFormula extends Card implements IProjectCard {
  private readonly rolledCost: number;

  constructor(name: CardName = CardName.BOOTLEG_TERRAFORMING_FORMULA, cost: number = BOOTLEG_TERRAFORMING_FORMULA_MIN_COST) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'BM09',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1));
        }),
        description: 'Raise your plant production 1 step.',
      },
    });
    this.rolledCost = cost;
  }

  public override get cost(): number {
    return this.rolledCost;
  }
}

export class BootlegTerraformingFormulaII extends BootlegTerraformingFormula {
  constructor() {
    super(CardName.BOOTLEG_TERRAFORMING_FORMULA_II);
  }
}

export class BootlegTerraformingFormulaIII extends BootlegTerraformingFormula {
  constructor() {
    super(CardName.BOOTLEG_TERRAFORMING_FORMULA_III);
  }
}
