import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class SmuggledReactorCore extends Card implements IProjectCard {
  constructor(name: CardName = CardName.SMUGGLED_REACTOR_CORE, cost: number = 1) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER, Tag.BUILDING],
      cost,
      reserveUnits: {titanium: 2},
      victoryPoints: -1,

      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'BM03',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(2, {digit}).plainText('Spend 2 titanium.', /** parens */ true).br;
          b.production((pb) => pb.energy(2));
        }),
        description: 'Spend 2 titanium. Raise your energy production 2 steps.',
      },
    });
  }
}

export class SmuggledReactorCoreII extends SmuggledReactorCore {
  constructor() {
    super(CardName.SMUGGLED_REACTOR_CORE_II, 2);
  }
}

export class SmuggledReactorCoreIII extends SmuggledReactorCore {
  constructor() {
    super(CardName.SMUGGLED_REACTOR_CORE_III, 3);
  }
}
