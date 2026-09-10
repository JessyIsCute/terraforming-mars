import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class StolenBlueprints extends Card implements IProjectCard {
  constructor(name: CardName = CardName.STOLEN_BLUEPRINTS, steel: number = 2) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.BUILDING],
      cost: 0,
      reserveUnits: {steel},
      victoryPoints: -1,

      behavior: {
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'BM10',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(steel, {digit}).plainText(`Spend ${steel} steel.`, /** parens */ true).br;
          b.cards(1);
        }),
        description: `Spend ${steel} steel. Draw a card.`,
      },
    });
  }
}

export class StolenBlueprintsII extends StolenBlueprints {
  constructor() {
    super(CardName.STOLEN_BLUEPRINTS_II, 3);
  }
}

export class StolenBlueprintsIII extends StolenBlueprints {
  constructor() {
    super(CardName.STOLEN_BLUEPRINTS_III, 4);
  }
}
