import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class StolenBlueprints extends Card implements IProjectCard {
  constructor(name: CardName = CardName.STOLEN_BLUEPRINTS) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.BUILDING],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'BM10',
        renderData: CardRenderer.builder((b) => {
          b.cards(1);
        }),
        description: 'Draw a card.',
      },
    });
  }
}

export class StolenBlueprintsII extends StolenBlueprints {
  constructor() {
    super(CardName.STOLEN_BLUEPRINTS_II);
  }
}

export class StolenBlueprintsIII extends StolenBlueprints {
  constructor() {
    super(CardName.STOLEN_BLUEPRINTS_III);
  }
}
