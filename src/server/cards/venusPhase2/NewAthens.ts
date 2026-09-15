import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {VenusPhase2Expansion} from '../../venusPhase2/VenusPhase2Expansion';
import {PlaceVenusCityTile} from '../../venusPhase2/PlaceVenusCityTile';

export class NewAthens extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_ATHENS,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 19,
      requirements: {venus: 8},

      behavior: {
        global: {venus: 1},
        addResourcesToAnyCard: [
          {type: CardResource.SCIENCE, count: 1},
          {type: CardResource.FLOATER, count: 2},
        ],
      },

      metadata: {
        cardNumber: 'V89',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.SCIENCE, 1).resource(CardResource.FLOATER, 2).nbsp.tile(TileType.CITY, true).venus(1);
        }),
        description: 'Requires Venus 8% or more. Add 1 science resource to any card and 2 floaters to any card. ' +
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
