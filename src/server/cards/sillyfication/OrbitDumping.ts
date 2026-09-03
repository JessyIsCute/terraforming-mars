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

      metadata: {
        cardNumber: 'X31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(2, {all}));
        }),
        description: 'Every opponent loses 2 M€ production.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      if (opponent.canHaveProductionReduced(Resource.MEGACREDITS, 2, player)) {
        opponent.production.add(Resource.MEGACREDITS, -2, {log: true, from: {player}});
      }
    }
    return undefined;
  }
}
