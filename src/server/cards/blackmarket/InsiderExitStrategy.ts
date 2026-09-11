import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/**
 * Mid-game tier (unlocks generation 4+): a repeatable, bespoke (non-declarative) action --
 * `Behavior` has no "pass" effect, so this can't use the declarative `action: {...}` DSL like
 * `ActionCard` subclasses (e.g. SolarPanelFoundry.ts) do; it overrides `canAct`/`action`
 * directly, mirroring ExtremeColdFungus.ts's pattern for a bespoke ACTIVE card.
 */
export class InsiderExitStrategy extends Card implements IActionCard, IProjectCard {
  constructor(name: CardName = CardName.INSIDER_EXIT_STRATEGY, cost: number = 6) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH],
      cost,
      victoryPoints: -1,

      metadata: {
        cardNumber: 'BM25',
        renderData: CardRenderer.builder((b) => {
          b.action('If no other player has passed, pass and gain 2 M€ and 2 plants.', (eb) => {
            eb.startAction.megacredits(2).nbsp.plants(2);
          });
        }),
        description: 'If no other player has passed yet this generation, you may pass and gain 2 M€ and 2 plants (get out before the rest of the table sees the crash coming).',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const game = player.game;
    return !game.players.some((other) => other.id !== player.id && game.hasPassedThisActionPhase(other));
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    player.stock.add(Resource.PLANTS, 2, {log: true});
    player.pass();
    return undefined;
  }
}

export class InsiderExitStrategyII extends InsiderExitStrategy {
  constructor() {
    super(CardName.INSIDER_EXIT_STRATEGY_II, 7);
  }
}

export class InsiderExitStrategyIII extends InsiderExitStrategy {
  constructor() {
    super(CardName.INSIDER_EXIT_STRATEGY_III, 8);
  }
}
