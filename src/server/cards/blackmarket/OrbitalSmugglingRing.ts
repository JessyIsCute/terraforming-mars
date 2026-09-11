import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardRenderer} from '../render/CardRenderer';

/** Late-game tier (unlocks generation 7+): requires Venus (registered with `compatibility: 'venus'`) since it prints a Venus tag and raises the Venus scale. */
export class OrbitalSmugglingRing extends ActionCard implements IProjectCard {
  constructor(name: CardName = CardName.ORBITAL_SMUGGLING_RING, cost: number = 9) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.VENUS],
      cost,
      victoryPoints: -2,

      action: {
        spend: {titanium: 1},
        global: {venus: 1},
      },

      metadata: {
        cardNumber: 'BM28',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium to raise Venus 1 step.',
            (eb) => eb.startAction.titanium(1).arrow().venus(1));
        }),
        description: 'Spend 1 titanium to raise Venus 1 step (smuggle contraband into Venus\'s cloud cities).',
      },
    });
  }
}

export class OrbitalSmugglingRingII extends OrbitalSmugglingRing {
  constructor() {
    super(CardName.ORBITAL_SMUGGLING_RING_II, 10);
  }
}
