import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export const URANIUM_SMUGGLE_MIN_COST = 8;
export const URANIUM_SMUGGLE_MAX_COST = 11;

/**
 * A variable-cost Black Market design: the price shown here (8) is only the default used
 * when reconstructed with no override (e.g. on game reload) -- `BlackMarket.ts` rolls the
 * real price once, at deal time, via the `cost` constructor param, and it's exposed through
 * an overridden `cost` getter so it never touches `Card.ts`'s shared, `CardName`-keyed
 * properties cache (which would otherwise make every future instance of this printing reuse
 * whichever cost happened to be rolled first).
 */
export class UraniumSmuggle extends Card implements IProjectCard {
  private readonly rolledCost: number;

  constructor(name: CardName = CardName.URANIUM_SMUGGLE, cost: number = URANIUM_SMUGGLE_MIN_COST) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        production: {energy: 1},
        stock: {titanium: 1},
      },

      metadata: {
        cardNumber: 'BM02',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).nbsp.titanium(1);
        }),
        description: 'Raise your energy production 1 step and gain 1 titanium.',
      },
    });
    this.rolledCost = cost;
  }

  public override get cost(): number {
    return this.rolledCost;
  }
}

export class UraniumSmuggleII extends UraniumSmuggle {
  constructor() {
    super(CardName.URANIUM_SMUGGLE_II);
  }
}

export class UraniumSmuggleIII extends UraniumSmuggle {
  constructor() {
    super(CardName.URANIUM_SMUGGLE_III);
  }
}
