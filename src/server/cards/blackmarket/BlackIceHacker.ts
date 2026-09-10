import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class BlackIceHacker extends Card implements IProjectCard {
  constructor(name: CardName = CardName.BLACK_ICE_HACKER) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 0,
      reserveUnits: {energy: 3},
      victoryPoints: -1,

      behavior: {
        drawCard: 1,
        stock: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'BM06',
        renderData: CardRenderer.builder((b) => {
          b.minus().energy(3, {digit}).plainText('Spend 3 energy.', /** parens */ true).br;
          b.cards(1).nbsp.megacredits(2);
        }),
        description: 'Spend 3 energy. Draw a card and gain 2 M€.',
      },
    });
  }
}

export class BlackIceHackerII extends BlackIceHacker {
  constructor() {
    super(CardName.BLACK_ICE_HACKER_II);
  }
}

export class BlackIceHackerIII extends BlackIceHacker {
  constructor() {
    super(CardName.BLACK_ICE_HACKER_III);
  }
}
