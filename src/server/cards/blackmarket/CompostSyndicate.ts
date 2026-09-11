import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): plant surplus buys into minerals, helping a terraforming-focused economy catch up on mining. */
export class CompostSyndicate extends Card implements IProjectCard {
  constructor(name: CardName = CardName.COMPOST_SYNDICATE, cost: number = 1, steel: number = 5) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING],
      cost,
      reserveUnits: {plants: 3},
      victoryPoints: -1,

      behavior: {
        stock: {steel},
      },

      metadata: {
        cardNumber: 'BM15',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(3, {digit}).plainText('Spend 3 plants.', /** parens */ true).br;
          b.steel(steel);
        }),
        description: `Spend 3 plants. Gain ${steel} steel (turn a greenhouse surplus into scrap-metal profit).`,
      },
    });
  }
}

export class CompostSyndicateII extends CompostSyndicate {
  constructor() {
    super(CardName.COMPOST_SYNDICATE_II, 2, 6);
  }
}

export class CompostSyndicateIII extends CompostSyndicate {
  constructor() {
    super(CardName.COMPOST_SYNDICATE_III, 3, 7);
  }
}
