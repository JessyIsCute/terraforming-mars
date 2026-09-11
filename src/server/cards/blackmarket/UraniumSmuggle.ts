import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class UraniumSmuggle extends Card implements IProjectCard {
  constructor(name: CardName = CardName.URANIUM_SMUGGLE, cost: number = 8) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost,
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
  }
}

export class UraniumSmuggleII extends UraniumSmuggle {
  constructor() {
    super(CardName.URANIUM_SMUGGLE_II, 9);
  }
}

export class UraniumSmuggleIII extends UraniumSmuggle {
  constructor() {
    super(CardName.URANIUM_SMUGGLE_III, 10);
  }
}

export class UraniumSmuggleIV extends UraniumSmuggle {
  constructor() {
    super(CardName.URANIUM_SMUGGLE_IV, 11);
  }
}
