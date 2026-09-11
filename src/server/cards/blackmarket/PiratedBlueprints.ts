import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/** Late-game tier (unlocks generation 7+): another knockoff discount, weaker than Corrupt Office (1 M€) and aimed at Building tags. */
export class PiratedBlueprints extends Card implements IProjectCard {
  constructor(name: CardName = CardName.PIRATED_BLUEPRINTS, cost: number = 9) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost,
      victoryPoints: -2,

      cardDiscount: {tag: Tag.BUILDING, amount: 1},

      metadata: {
        cardNumber: 'BM39',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Building tag, you pay 1 M€ less for it.', (eb) => {
            eb.tag(Tag.BUILDING).startEffect.megacredits(-1);
          });
        }),
      },
    });
  }
}

export class PiratedBlueprintsII extends PiratedBlueprints {
  constructor() {
    super(CardName.PIRATED_BLUEPRINTS_II, 10);
  }
}
