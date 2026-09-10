import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export const CLASSIFIED_RESEARCH_MIN_COST = 7;
export const CLASSIFIED_RESEARCH_MAX_COST = 9;

/**
 * A variable-cost Black Market design: the price shown here (7) is only the default used
 * when reconstructed with no override (e.g. on game reload) -- `BlackMarket.ts` rolls the
 * real price once, at deal time, via the `cost` constructor param, and it's exposed through
 * an overridden `cost` getter so it never touches `Card.ts`'s shared, `CardName`-keyed
 * properties cache (which would otherwise make every future instance of this printing reuse
 * whichever cost happened to be rolled first).
 */
export class ClassifiedResearch extends Card implements IProjectCard {
  private readonly rolledCost: number;

  constructor(name: CardName = CardName.CLASSIFIED_RESEARCH, cost: number = CLASSIFIED_RESEARCH_MIN_COST) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.SCIENCE],
      cost: 0,
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
    this.rolledCost = cost;
  }

  public override get cost(): number {
    return this.rolledCost;
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
