import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

/** Mid-game tier (unlocks generation 4+): skims heat off your own temperature increases -- mirrors HomeostasisBureau.ts's `onGlobalParameterIncrease` hook (M€ there, heat here). An "Effect:" card, so it's blue (ACTIVE) like HomeostasisBureau/VenusWaystation, even though it has no repeatable action. */
export class ThermalSkimOperation extends Card implements IProjectCard {
  constructor(name: CardName = CardName.THERMAL_SKIM_OPERATION, cost: number = 5) {
    super({
      name,
      type: CardType.ACTIVE,
      tags: [Tag.POWER],
      cost,
      victoryPoints: -1,

      behavior: {
        stock: {heat: 2},
      },

      metadata: {
        cardNumber: 'BM35',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise the temperature, gain 1 heat.', (eb) => eb.temperature(1).startEffect.heat(1));
          b.br;
          b.heat(2);
        }),
        description: 'Gain 2 heat.',
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.stock.add(Resource.HEAT, steps, {log: true});
    }
  }
}

export class ThermalSkimOperationII extends ThermalSkimOperation {
  constructor() {
    super(CardName.THERMAL_SKIM_OPERATION_II, 6);
  }
}

export class ThermalSkimOperationIII extends ThermalSkimOperation {
  constructor() {
    super(CardName.THERMAL_SKIM_OPERATION_III, 7);
  }
}
