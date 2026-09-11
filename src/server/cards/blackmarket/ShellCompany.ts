import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/** Mid-game tier (unlocks generation 4+): a knockoff of Corrupt Office's discount, weaker (1 M€, not 2) and aimed at Earth tags instead of Crime. */
export class ShellCompany extends Card implements IProjectCard {
  constructor(name: CardName = CardName.SHELL_COMPANY, cost: number = 6) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH],
      cost,
      victoryPoints: -1,

      cardDiscount: {tag: Tag.EARTH, amount: 1},

      metadata: {
        cardNumber: 'BM37',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an Earth tag, you pay 1 M€ less for it.', (eb) => {
            eb.tag(Tag.EARTH).startEffect.megacredits(-1);
          });
        }),
      },
    });
  }
}

export class ShellCompanyII extends ShellCompany {
  constructor() {
    super(CardName.SHELL_COMPANY_II, 7);
  }
}

export class ShellCompanyIII extends ShellCompany {
  constructor() {
    super(CardName.SHELL_COMPANY_III, 8);
  }
}
