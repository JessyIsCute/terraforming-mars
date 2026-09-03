import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {TileType} from '../../../common/TileType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {PlaceTile} from '../../deferredActions/PlaceTile';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {Priority} from '../../deferredActions/Priority';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class GarbageDumps extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.GARBAGE_DUMPS,
      tags: [Tag.BUILDING],
      cost: 9,
      victoryPoints: -1,

      metadata: {
        cardNumber: 'X32',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.GARBAGE_DUMP, true).br;
          b.minus().tr(1, {all});
        }),
        description: 'Place this tile. Choose a player. That player loses 1 TR.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.defer(new PlaceTile(player, {
      tile: {tileType: TileType.GARBAGE_DUMP, card: this.name},
      on: 'land',
      title: 'Select space for Garbage Dumps',
    }));
    if (game.players.length > 1) {
      game.defer(new SimpleDeferredAction(player, () =>
        new SelectPlayer(game.players, 'Choose a player to lose 1 TR', 'Select').andThen((target) => {
          target.decreaseTerraformRating(1, {log: true});
          return undefined;
        }), Priority.ATTACK_OPPONENT));
    }
    return undefined;
  }
}
