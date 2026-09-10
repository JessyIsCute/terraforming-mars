import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class PoachedSpecimens extends Card implements IProjectCard {
  constructor(name: CardName = CardName.POACHED_SPECIMENS, plants: number = 1) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL],
      cost: 0,
      reserveUnits: {plants, energy: 2},
      victoryPoints: -1,

      behavior: {
        stock: {megacredits: 6},
      },

      metadata: {
        cardNumber: 'BM04',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(plants, {digit}).nbsp.minus().energy(2, {digit}).plainText(`Spend ${plants} plant and 2 energy.`, /** parens */ true).br;
          b.megacredits(6);
        }),
        description: `Spend ${plants} plant and 2 energy. Gain 6 M€ (sell poached wildlife on the black market).`,
      },
    });
  }
}

export class PoachedSpecimensII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_II, 2);
  }
}

export class PoachedSpecimensIII extends PoachedSpecimens {
  constructor() {
    super(CardName.POACHED_SPECIMENS_III, 3);
  }
}
