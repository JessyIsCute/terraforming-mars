import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class ClassifiedResearch extends Card implements IProjectCard {
  constructor(name: CardName = CardName.CLASSIFIED_RESEARCH) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.SCIENCE],
      cost: 5,
      victoryPoints: -1,

      behavior: {
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'BM01',
        renderData: CardRenderer.builder((b) => {
          b.cards(1);
        }),
        description: 'Draw a card.',
      },
    });
  }
}

/** A second "printing" of Classified Research -- see CardName.ts's Black Market comment for why. */
export class ClassifiedResearchII extends ClassifiedResearch {
  constructor() {
    super(CardName.CLASSIFIED_RESEARCH_II);
  }
}

export class ClassifiedResearchIII extends ClassifiedResearch {
  constructor() {
    super(CardName.CLASSIFIED_RESEARCH_III);
  }
}
