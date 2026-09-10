import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class BlackIceHacker extends Card implements IProjectCard {
  constructor(name: CardName = CardName.BLACK_ICE_HACKER, energy: number = 3) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 0,
      reserveUnits: {energy},
      victoryPoints: -1,

      behavior: {
        drawCard: 1,
        stock: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'BM06',
        renderData: CardRenderer.builder((b) => {
          b.minus().energy(energy, {digit}).plainText(`Spend ${energy} energy.`, /** parens */ true).br;
          b.cards(1).nbsp.megacredits(2);
        }),
        description: `Spend ${energy} energy. Draw a card and gain 2 M€.`,
      },
    });
  }
}

export class BlackIceHackerII extends BlackIceHacker {
  constructor() {
    super(CardName.BLACK_ICE_HACKER_II, 4);
  }
}

export class BlackIceHackerIII extends BlackIceHacker {
  constructor() {
    super(CardName.BLACK_ICE_HACKER_III, 5);
  }
}
