import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): mineral surplus buys into plant production, helping a mineral-heavy economy catch up on greenery. */
export class OreForOxygenRacket extends Card implements IProjectCard {
  constructor(name: CardName = CardName.ORE_FOR_OXYGEN_RACKET, cost: number = 1) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost,
      reserveUnits: {steel: 3},
      victoryPoints: -1,

      behavior: {
        production: {plants: 2},
      },

      metadata: {
        cardNumber: 'BM13',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(3, {digit}).plainText('Spend 3 steel.', /** parens */ true).br;
          b.production((pb) => pb.plants(2));
        }),
        description: 'Spend 3 steel. Raise your plant production 2 steps (trade mining tailings for fertile soil, off the books).',
      },
    });
  }
}

export class OreForOxygenRacketII extends OreForOxygenRacket {
  constructor() {
    super(CardName.ORE_FOR_OXYGEN_RACKET_II, 2);
  }
}

export class OreForOxygenRacketIII extends OreForOxygenRacket {
  constructor() {
    super(CardName.ORE_FOR_OXYGEN_RACKET_III, 3);
  }
}
