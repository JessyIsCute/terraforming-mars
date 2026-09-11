import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class PoachedSpecimens extends Card implements IProjectCard {
  constructor(name: CardName = CardName.POACHED_SPECIMENS, megacredits: number = 7) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL],
      cost: 0,
      reserveUnits: {energy: 1},
      victoryPoints: -1,

      behavior: {
        stock: {megacredits},
      },

      metadata: {
        cardNumber: 'BM04',
        renderData: CardRenderer.builder((b) => {
          b.minus().energy(1, {digit}).plainText('Spend 1 energy.', /** parens */ true).br;
          b.megacredits(megacredits);
        }),
        description: `Spend 1 energy. Gain ${megacredits} M€ (sell poached wildlife on the black market).`,
      },
    });
  }
}

export class PoachedSpecimensII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_II, 8);
  }
}

export class PoachedSpecimensIII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_III, 9);
  }
}

export class PoachedSpecimensIV extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_IV, 10);
  }
}
