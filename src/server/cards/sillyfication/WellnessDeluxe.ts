import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {GainResourcesDeferred} from '../../deferredActions/GainResourcesDeferred';
import {Priority} from '../../deferredActions/Priority';
import {all, digit} from '../Options';

export class WellnessDeluxe extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.WELLNESS_DELUXE,
      tags: [Tag.POWER],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'XC1',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.effect('When you place an ocean tile, increase your heat production 1 step.', (eb) => {
              eb.oceans(1, {size: Size.SMALL}).startEffect;
              eb.production((pb) => pb.heat(1));
            });
            ce.effect('When any ocean tile is placed, gain 3 heat.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).startEffect;
              eb.heat(3, {digit});
            });
            ce.effect('When you raise the temperature, gain 2 M€.', (eb) => {
              eb.temperature(1).startEffect;
              eb.megacredits(2);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (!Board.isUncoveredOceanSpace(space)) {
      return;
    }
    cardOwner.game.defer(
      new GainResourcesDeferred(cardOwner, Resource.HEAT, {count: 3, log: true, from: {card: this}}),
      cardOwner.id !== activePlayer.id ? Priority.OPPONENT_TRIGGER : undefined,
    );
    if (activePlayer.id === cardOwner.id) {
      cardOwner.production.add(Resource.HEAT, 1, {log: true, from: {card: this}});
    }
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.stock.add(Resource.MEGACREDITS, 2 * steps, {log: true});
    }
  }
}
