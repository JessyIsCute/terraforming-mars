import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {SelectColony} from '../../inputs/SelectColony';
import {IColony} from '../../colonies/IColony';
import {ColonyName} from '../../../common/colonies/ColonyName';
import {MAX_COLONIES_PER_TILE} from '../../../common/constants';

export class OvercrowdedColony extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OVERCROWDED_COLONY,
      tags: [Tag.SPACE],
      cost: 8,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'X50',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).asterix();
        }),
        description: 'Requires a colony tile that already has 3 colonies. Add a colony to that tile. You do not get a placement bonus.',
      },
    });
  }

  private fullColonies(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((colony) => colony.isActive && colony.colonies.length >= MAX_COLONIES_PER_TILE);
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return this.fullColonies(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const colonies = this.fullColonies(player);
    return new SelectColony('Select a full colony tile to add a colony to', 'Add colony', colonies)
      .andThen((colony) => {
        const game = player.game;
        game.log('${0} crammed an extra colony onto ${1}', (b) => b.player(player).colony(colony));
        colony.colonies.push(player.id);
        if (colony.trackPosition < colony.colonies.length) {
          colony.trackPosition = colony.colonies.length;
        }
        for (const cardOwner of game.players) {
          for (const card of cardOwner.tableau) {
            card.onColonyAddedByAnyPlayer?.(cardOwner, player);
          }
        }
        if (colony.name === ColonyName.LEAVITT) {
          player.triggerOnNonCardTagAdded(Tag.SCIENCE);
        }
        return undefined;
      });
  }
}
