import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {VenusPhase2Expansion} from '../../venusPhase2/VenusPhase2Expansion';
import {PlaceVenusCityTile} from '../../venusPhase2/PlaceVenusCityTile';

export class NewBabylon extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_BABYLON,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 22,
      requirements: {venus: 12},

      behavior: {
        global: {venus: 1},
        production: {plants: 2},
      },

      metadata: {
        cardNumber: 'V96',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).nbsp.tile(TileType.CITY, true).venus(1);
        }),
        description: 'Requires Venus 12% or more. Increase your plant production 2 steps. ' +
          'Place a City tile on Venus and raise Venus 1 step.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    const data = VenusPhase2Expansion.venusPhase2Data(player.game);
    return data.venusSurface.getAvailableSpacesForLand(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new PlaceVenusCityTile(player));
    return undefined;
  }
}
