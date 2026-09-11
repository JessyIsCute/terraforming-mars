import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): plant surplus buys into titanium production. */
export class SmuggledSeedVault extends Card implements IProjectCard {
  constructor(name: CardName = CardName.SMUGGLED_SEED_VAULT, cost: number = 1) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost,
      reserveUnits: {plants: 4},
      victoryPoints: -1,

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'BM17',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(4, {digit}).plainText('Spend 4 plants.', /** parens */ true).br;
          b.production((pb) => pb.titanium(2));
        }),
        description: 'Spend 4 plants. Raise your titanium production 2 steps (barter heirloom seed stock for mining rights).',
      },
    });
  }
}

export class SmuggledSeedVaultII extends SmuggledSeedVault {
  constructor() {
    super(CardName.SMUGGLED_SEED_VAULT_II, 2);
  }
}

export class SmuggledSeedVaultIII extends SmuggledSeedVault {
  constructor() {
    super(CardName.SMUGGLED_SEED_VAULT_III, 3);
  }
}
