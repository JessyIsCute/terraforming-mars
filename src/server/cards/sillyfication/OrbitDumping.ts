import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class OrbitDumping extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ORBIT_DUMPING,
      tags: [Tag.SPACE],
      cost: 1,
      victoryPoints: -1,

      behavior: {
        stock: {titanium: 2},
      },

      metadata: {
        cardNumber: 'X31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(3, {all})).br;
          b.titanium(2);
        }),
        description: 'All players lose 3 M€ production. Gain 2 titanium.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      if (p.id === player.id) {
        p.production.add(Resource.MEGACREDITS, -3, {log: true});
      } else if (p.canHaveProductionReduced(Resource.MEGACREDITS, 3, player)) {
        p.production.add(Resource.MEGACREDITS, -3, {log: true, from: {player}});
      }
    }
    return undefined;
  }
}
