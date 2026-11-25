import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {AssemblerExpansion} from '../../assembler/AssemblerExpansion';

export class ProductionRun extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PRODUCTION_RUN,
      tags: [Tag.BUILDING, Tag.POWER],
      cost: 10,

      behavior: {
        production: {energy: 1},
        assemble: {count: 1, into: 'hand'},
      },

      metadata: {
        cardNumber: 'AS12',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).nbsp.assemble(1).br;
          b.assemble(2).asterix();
        }),
        description: 'Increase your energy production 1 step. Assemble a new card into your hand, and 2 more into the deck.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    AssemblerExpansion.assemble(player.game, 2, player);
    return undefined;
  }
}
