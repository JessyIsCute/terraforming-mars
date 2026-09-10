import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export const ROGUE_AI_CONTRACT_MIN_COST = 10;
export const ROGUE_AI_CONTRACT_MAX_COST = 14;

/** Variable-cost design -- see UraniumSmuggle.ts's doc comment for why `cost` is an overridden getter. */
export class RogueAiContract extends Card implements IProjectCard {
  private readonly rolledCost: number;

  constructor(name: CardName = CardName.ROGUE_AI_CONTRACT, cost: number = ROGUE_AI_CONTRACT_MIN_COST) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 0,
      victoryPoints: -2,

      behavior: {
        drawCard: 3,
      },

      metadata: {
        cardNumber: 'BM12',
        renderData: CardRenderer.builder((b) => {
          b.cards(3);
        }),
        description: 'Draw 3 cards.',
      },
    });
    this.rolledCost = cost;
  }

  public override get cost(): number {
    return this.rolledCost;
  }
}

export class RogueAiContractII extends RogueAiContract {
  constructor() {
    super(CardName.ROGUE_AI_CONTRACT_II);
  }
}

export class RogueAiContractIII extends RogueAiContract {
  constructor() {
    super(CardName.ROGUE_AI_CONTRACT_III);
  }
}
