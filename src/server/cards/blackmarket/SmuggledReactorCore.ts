import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class SmuggledReactorCore extends Card implements IProjectCard {
  constructor(name: CardName = CardName.SMUGGLED_REACTOR_CORE) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'BM03',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2));
        }),
        description: 'Raise your energy production 2 steps.',
      },
    });
  }
}

export class SmuggledReactorCoreII extends SmuggledReactorCore {
  constructor() {
    super(CardName.SMUGGLED_REACTOR_CORE_II);
  }
}

export class SmuggledReactorCoreIII extends SmuggledReactorCore {
  constructor() {
    super(CardName.SMUGGLED_REACTOR_CORE_III);
  }
}
