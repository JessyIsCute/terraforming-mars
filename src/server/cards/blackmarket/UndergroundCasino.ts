import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/** Requires Underworld (registered with `compatibility: 'underworld'`) since it prints a Crime tag. */
export class UndergroundCasino extends Card implements IProjectCard {
  constructor(name: CardName = CardName.UNDERGROUND_CASINO) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.CRIME, Tag.BUILDING],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        production: {megacredits: 4},
      },

      metadata: {
        cardNumber: 'BM08',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(4));
        }),
        description: 'Raise your M€ production 4 steps.',
      },
    });
  }
}

export class UndergroundCasinoII extends UndergroundCasino {
  constructor() {
    super(CardName.UNDERGROUND_CASINO_II);
  }
}

export class UndergroundCasinoIII extends UndergroundCasino {
  constructor() {
    super(CardName.UNDERGROUND_CASINO_III);
  }
}
