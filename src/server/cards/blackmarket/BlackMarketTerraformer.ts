import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

/** Late-game tier (unlocks generation 7+): a specialized plant+heat-to-dual-mineral-production conversion, for a terraforming-heavy economy still lacking minerals late. */
export class BlackMarketTerraformer extends Card implements IProjectCard {
  constructor(name: CardName = CardName.BLACK_MARKET_TERRAFORMER, plants: number = 5) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.SPACE],
      cost: 0,
      reserveUnits: {plants, heat: 3},
      victoryPoints: -2,

      behavior: {
        production: {titanium: 2, steel: 2},
      },

      metadata: {
        cardNumber: 'BM23',
        renderData: CardRenderer.builder((b) => {
          b.minus().plants(plants, {digit}).nbsp.minus().heat(3, {digit}).plainText(`Spend ${plants} plants and 3 heat.`, /** parens */ true).br;
          b.production((pb) => pb.titanium(2).nbsp.steel(2));
        }),
        description: `Spend ${plants} plants and 3 heat. Raise your titanium production 2 steps and steel production 2 steps.`,
      },
    });
  }
}

export class BlackMarketTerraformerII extends BlackMarketTerraformer {
  constructor() {
    super(CardName.BLACK_MARKET_TERRAFORMER_II, 6);
  }
}

export class BlackMarketTerraformerIII extends BlackMarketTerraformer {
  constructor() {
    super(CardName.BLACK_MARKET_TERRAFORMER_III, 7);
  }
}
