import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';

export class AssistedGrowthPlants extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ASSISTED_GROWTH_PLANTS,
      tags: [Tag.PLANT, Tag.SCIENCE],
      cost: 35,

      // 14% is the maximum oxygen level, so this requirement effectively means "oxygen at maximum."
      requirements: {oxygen: 14},

      metadata: {
        cardNumber: 'B45',
        renderData: CardRenderer.builder((b) => {
          b.greenery().greenery().greenery();
        }),
        description: 'Requires oxygen at maximum. Place 3 greenery tiles.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.game.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.defer(new PlaceGreeneryTile(player));
    game.defer(new PlaceGreeneryTile(player));
    game.defer(new PlaceGreeneryTile(player));
    return undefined;
  }
}
