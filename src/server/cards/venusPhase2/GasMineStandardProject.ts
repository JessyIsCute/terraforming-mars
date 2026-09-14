import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';
import {VenusPhase2Expansion} from '../../venusPhase2/VenusPhase2Expansion';
import {PlaceGasMineTile} from '../../venusPhase2/PlaceGasMineTile';
import {Resource} from '../../../common/Resource';
import {StandardProjectCanPayWith} from '../../../common/cards/Types';

export class GasMineStandardProject extends StandardProjectCard {
  constructor(properties = {
    name: CardName.GAS_MINE_STANDARD_PROJECT,
    cost: 21,

    metadata: {
      cardNumber: '',
      renderData: CardRenderer.builder((b) =>
        b.standardProject('Spend 21 M€ to place a Gas Mine on a gaslight space on the Venus surface and raise your heat production 1 step. Floaters (from any of your cards) each knock 3 M€ off this cost.', (eb) => {
          eb.megacredits(21).startAction.plainText('Gas Mine').production((pb) => pb.heat(1));
        }),
      ),
    },
  }) {
    super(properties);
  }

  public override canAct(player: IPlayer): boolean {
    const data = VenusPhase2Expansion.venusPhase2Data(player.game);
    if (data.venusSurface.getAvailableSpacesForGaslight(player).length === 0) {
      return false;
    }
    return super.canAct(player);
  }

  public override canPayWith(): StandardProjectCanPayWith {
    return {anyFloaters: true};
  }

  actionEssence(player: IPlayer): void {
    player.game.defer(new PlaceGasMineTile(player));
    player.production.add(Resource.HEAT, 1, {log: true});
  }
}
