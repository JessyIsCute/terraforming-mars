import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class PoachedSpecimens extends Card implements IProjectCard {
  constructor(name: CardName = CardName.POACHED_SPECIMENS) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        stock: {megacredits: 6},
      },

      metadata: {
        cardNumber: 'BM04',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(6);
        }),
        description: 'Gain 6 M€ (sell poached wildlife on the black market).',
      },
    });
  }
}

export class PoachedSpecimensII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_II);
  }
}

export class PoachedSpecimensIII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_III);
  }
}
