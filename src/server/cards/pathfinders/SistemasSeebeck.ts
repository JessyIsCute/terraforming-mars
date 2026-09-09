import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {DrawCards} from '../../deferredActions/DrawCards';
import {Behavior} from '../../behavior/Behavior';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectAmount} from '../../inputs/SelectAmount';

/** Whether a single declarative behavior block spends energy or heat. */
function spendsEnergyOrHeat(behavior: Behavior | undefined): boolean {
  if (behavior === undefined) {
    return false;
  }
  return behavior.spend?.energy !== undefined || behavior.spend?.heat !== undefined;
}

/** Whether a card spends energy or heat as a cost, either on play (`behavior`) or as its
 * repeatable action (`actionBehavior`) - used by Sistemas Seebeck's initial draw filter.
 * Most energy/heat spenders (e.g. Ironworks' "spend 4 energy") are the latter. Cards that
 * merely grant energy or heat (production or stock) don't count - only ones that use it as
 * a cost. */
function usesEnergyOrHeat(card: {behavior?: Behavior, actionBehavior?: Behavior}): boolean {
  return spendsEnergyOrHeat(card.behavior) || spendsEnergyOrHeat(card.actionBehavior);
}

export class SistemasSeebeck extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SISTEMAS_SEEBECK,
      tags: [Tag.SCIENCE, Tag.POWER],
      startingMegaCredits: 45,
      initialActionText: 'Draw cards until you draw 2 cards that spend energy or heat, then shuffle the rest back',

      metadata: {
        cardNumber: 'PfC97', // Renumber
        description: 'You start with 45 M€. Draw cards until you draw 2 cards that spend energy or heat - shuffle the rest back.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).br;
          b.text('2X', {size: Size.SMALL}).cards(1).colon().minus().energy(1, {size: Size.SMALL}).slash().minus().heat(1, {size: Size.SMALL});
          b.corpBox('effect', (ce) => {
            ce.effect('You can use energy and heat (and production of energy and heat) interchangeably as one resource.', (eb) => {
              eb.energy(1, {size: Size.SMALL}).startEffect.heat(1, {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer): PlayerInput | undefined {
    player.game.defer(DrawCards.keepAll(player, 2, {
      include: (card) => usesEnergyOrHeat(card),
    }));
    return undefined;
  }

  /** A free conversion (energy<->heat, stock and production) offered directly in
   * Player.getActions() alongside Convert Plants/Convert Heat - unlike those, using it
   * does not consume one of the player's actions for the turn (see
   * Player.skipNextActionIncrement). Returns undefined if the player doesn't have this
   * corporation, or has nothing convertible right now. */
  public static buildFreeConvertAction(player: IPlayer): PlayerInput | undefined {
    if (!player.tableau.has(CardName.SISTEMAS_SEEBECK)) {
      return undefined;
    }

    const options: Array<SelectOption> = [];

    const addStockOption = (from: typeof Resource.ENERGY | typeof Resource.HEAT, to: typeof Resource.ENERGY | typeof Resource.HEAT) => {
      const available = player.stock.get(from);
      if (available <= 0) {
        return;
      }
      options.push(new SelectOption(`Convert ${from} to ${to}`, 'Convert').andThen(() => {
        return new SelectAmount(`Select amount of ${from} to convert to ${to}`, 'Convert', 1, available)
          .andThen((amount) => {
            player.stock.deduct(from, amount);
            player.stock.add(to, amount, {log: true});
            player.skipNextActionIncrement = true;
            return undefined;
          });
      }));
    };

    const addProductionOption = (from: typeof Resource.ENERGY | typeof Resource.HEAT, to: typeof Resource.ENERGY | typeof Resource.HEAT) => {
      const available = player.production.get(from);
      if (available <= 0) {
        return;
      }
      options.push(new SelectOption(`Convert ${from} production to ${to} production`, 'Convert').andThen(() => {
        return new SelectAmount(`Select amount of ${from} production to convert to ${to} production`, 'Convert', 1, available)
          .andThen((amount) => {
            player.production.add(from, -amount, {log: true, skipSeebeckRedistribution: true});
            player.production.add(to, amount, {log: true});
            player.skipNextActionIncrement = true;
            return undefined;
          });
      }));
    };

    addStockOption(Resource.HEAT, Resource.ENERGY);
    addStockOption(Resource.ENERGY, Resource.HEAT);
    addProductionOption(Resource.HEAT, Resource.ENERGY);
    addProductionOption(Resource.ENERGY, Resource.HEAT);

    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Sistemas Seebeck: convert energy/heat (does not use your action)');
  }
}
