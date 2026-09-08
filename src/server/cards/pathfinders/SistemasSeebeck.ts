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

/** Whether a card's declarative behavior/action ever produces, stores, or spends energy
 * or heat - used by Sistemas Seebeck's initial draw filter. */
function usesEnergyOrHeat(behavior: Behavior | undefined): boolean {
  if (behavior === undefined) {
    return false;
  }
  return behavior.production?.energy !== undefined ||
    behavior.production?.heat !== undefined ||
    behavior.stock?.energy !== undefined ||
    behavior.stock?.heat !== undefined ||
    behavior.spend?.energy !== undefined ||
    behavior.spend?.heat !== undefined;
}

export class SistemasSeebeck extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SISTEMAS_SEEBECK,
      tags: [Tag.SCIENCE, Tag.POWER],
      startingMegaCredits: 45,
      initialActionText: 'Draw cards until you draw 2 cards with effects or actions that use energy or heat, then shuffle the rest back',

      metadata: {
        cardNumber: 'PfC97', // Renumber
        description: 'You start with 45 M€. Draw cards until you draw 2 cards with effects or actions that use energy production or heat production, or energy or heat directly - shuffle the rest back.',
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
      include: (card) => usesEnergyOrHeat(card.behavior),
    }));
    return undefined;
  }
}
