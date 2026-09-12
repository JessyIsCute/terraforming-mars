import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class RogueAiContract extends Card implements IProjectCard {
  constructor(name: CardName = CardName.ROGUE_AI_CONTRACT, cost: number = 8) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost,
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
  }
}

export class RogueAiContractII extends RogueAiContract {
  constructor() {
    super(CardName.ROGUE_AI_CONTRACT_II, 9);
  }
}

export class RogueAiContractIII extends RogueAiContract {
  constructor() {
    super(CardName.ROGUE_AI_CONTRACT_III, 10);
  }
}
