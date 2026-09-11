import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Mid-game tier (unlocks generation 4+): plant surplus buys into titanium production. */
export class SmuggledSeedVault extends Card implements IProjectCard {
  constructor(name: CardName = CardName.SMUGGLED_SEED_VAULT, plants: number = 4) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost: 0,
      reserveUnits: {plants},
      victoryPoints: -1,

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'BM17',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(plants, {digit}).plainText(`Spend ${plants} plants.`, /** parens */ true).br;
          b.production((pb) => pb.titanium(2));
        }),
        description: `Spend ${plants} plants. Raise your titanium production 2 steps (barter heirloom seed stock for mining rights).`,
      },
    });
  }
}

export class SmuggledSeedVaultII extends SmuggledSeedVault {
  constructor() {
    super(CardName.SMUGGLED_SEED_VAULT_II, 5);
  }
}

export class SmuggledSeedVaultIII extends SmuggledSeedVault {
  constructor() {
    super(CardName.SMUGGLED_SEED_VAULT_III, 6);
  }
}
