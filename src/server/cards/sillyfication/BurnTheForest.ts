import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {TileType} from '../../../common/TileType';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class BurnTheForest extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BURN_THE_FOREST,
      tags: [Tag.PLANT],
      cost: 13,
      victoryPoints: -1,

      metadata: {
        cardNumber: 'T11',
        renderData: CardRenderer.builder((b) => {
          b.minus().greenery({withO2: false}).plus().tile(TileType.GARBAGE_DUMP, true).asterix().br;
          b.production((pb) => pb.heat(3)).nbsp.heat(9, {digit});
        }),
        description: 'Remove one of your greenery tiles (does not affect oxygen). Place this tile there instead, ' +
          'gaining the normal placement bonus. Increase your heat production 3 steps and gain 9 heat.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.game.board.getGreeneries(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const greeneries = player.game.board.getGreeneries(player);
    return new SelectSpace('Select a greenery tile to remove', greeneries)
      .andThen((space) => {
        const game = player.game;
        game.removeTile(space.id);
        game.addTile(player, space, {tileType: TileType.GARBAGE_DUMP, card: this.name});
        player.production.add(Resource.HEAT, 3, {log: true});
        player.stock.add(Resource.HEAT, 9, {log: true});
        return undefined;
      });
  }
}
