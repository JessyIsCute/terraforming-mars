import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';
import {VenusPhase2Expansion} from '../../venusPhase2/VenusPhase2Expansion';
import {PlaceCloudCityTile} from '../../venusPhase2/PlaceCloudCityTile';
import {Resource} from '../../../common/Resource';

export class CloudCityStandardProject extends StandardProjectCard {
  constructor(properties = {
    name: CardName.CLOUD_CITY_STANDARD_PROJECT,
    cost: 25,

    metadata: {
      cardNumber: '',
      renderData: CardRenderer.builder((b) =>
        b.standardProject('Spend 25 M€ to place a Cloud City on the Venus surface and raise your M€ production 1 step. Floaters (from any of your cards) each knock 3 M€ off this cost.', (eb) => {
          eb.megacredits(25).startAction.plainText('Cloud City').production((pb) => pb.megacredits(1));
        }),
      ),
    },
  }) {
    super(properties);
  }

  public override canAct(player: IPlayer): boolean {
    const data = VenusPhase2Expansion.venusPhase2Data(player.game);
    if (data.venusSurface.getAvailableSpacesForLand(player).length === 0) {
      return false;
    }
    return super.canAct(player);
  }

  actionEssence(player: IPlayer): void {
    player.game.defer(new PlaceCloudCityTile(player));
    player.production.add(Resource.MEGACREDITS, 1, {log: true});
  }
}
