import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';
import {VenusPhase2Expansion} from '../../venusPhase2/VenusPhase2Expansion';
import {PlaceFloaterArrayTile} from '../../venusPhase2/PlaceFloaterArrayTile';

export class FloaterArrayStandardProject extends StandardProjectCard {
  constructor(properties = {
    name: CardName.FLOATER_ARRAY_STANDARD_PROJECT,
    cost: 19,

    metadata: {
      cardNumber: '',
      renderData: CardRenderer.builder((b) =>
        b.standardProject('Spend 19 M€ to place a Floater Array on the Venus surface. Adjacent Gas Mines and Cloud Cities each score 1 VP per adjacent Floater Array at game end. Floaters (from any of your cards) each knock 3 M€ off this cost.', (eb) => {
          eb.megacredits(19).startAction.plainText('Floater Array');
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
    player.game.defer(new PlaceFloaterArrayTile(player));
  }
}
