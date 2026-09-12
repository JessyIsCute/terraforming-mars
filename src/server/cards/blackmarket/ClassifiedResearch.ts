import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class ClassifiedResearch extends Card implements IProjectCard {
  constructor(name: CardName = CardName.CLASSIFIED_RESEARCH, cost: number = 7) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.SCIENCE],
      cost,
      reserveUnits: {energy: 1},
      victoryPoints: -2,

      behavior: {
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'BM01',
        renderData: CardRenderer.builder((b) => {
          b.minus().energy(1, {digit}).plainText('Spend 1 energy.', /** parens */ true).br;
          b.cards(1);
        }),
        description: 'Spend 1 energy. Draw a card.',
      },
    });
  }
}

/** A second "printing" of Classified Research -- see CardName.ts's Black Market comment for why. */
export class ClassifiedResearchII extends ClassifiedResearch {
  constructor() {
    super(CardName.CLASSIFIED_RESEARCH_II, 8);
  }
}

export class ClassifiedResearchIII extends ClassifiedResearch {
  constructor() {
    super(CardName.CLASSIFIED_RESEARCH_III, 9);
  }
}

export class ClassifiedResearchIV extends ClassifiedResearch {
  constructor() {
    super(CardName.CLASSIFIED_RESEARCH_IV, 10);
  }
}
