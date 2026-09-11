import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a big mineral-fueled TR grab -- the roster's most specialized reward, unique to this design. */
export class RogueTerraformingCartel extends Card implements IProjectCard {
  constructor(name: CardName = CardName.ROGUE_TERRAFORMING_CARTEL, titanium: number = 4) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.EARTH],
      cost: 0,
      reserveUnits: {titanium, steel: 4},
      victoryPoints: -2,

      behavior: {
        tr: 6,
      },

      metadata: {
        cardNumber: 'BM24',
        renderData: CardRenderer.builder((b) => {
          b.minus().titanium(titanium, {digit}).nbsp.minus().steel(4, {digit}).plainText(`Spend ${titanium} titanium and 4 steel.`, /** parens */ true).br;
          b.tr(6);
        }),
        description: `Spend ${titanium} titanium and 4 steel. Gain 6 TR.`,
      },
    });
  }
}

export class RogueTerraformingCartelII extends RogueTerraformingCartel {
  constructor() {
    super(CardName.ROGUE_TERRAFORMING_CARTEL_II, 5);
  }
}

export class RogueTerraformingCartelIII extends RogueTerraformingCartel {
  constructor() {
    super(CardName.ROGUE_TERRAFORMING_CARTEL_III, 6);
  }
}
