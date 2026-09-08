import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {SelectProductionToLoseDeferred} from '../../deferredActions/SelectProductionToLoseDeferred';
import {all} from '../Options';

export class TropicalResort extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TROPICAL_RESORT,
      tags: [Tag.BUILDING],
      cost: 13,

      behavior: {
        production: {megacredits: 3},
      },
      victoryPoints: 2,

      metadata: {
        cardNumber: '098',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.minus().wild(2, {all}).br;
            pb.plus().megacredits(3);
          });
        }),
        description: 'Reduce 2 steps of production of your choice, in any combination, and increase your M€ production 3 steps.',
      },
    });
  }

  public override bespokePlay(player: IPlayer): PlayerInput | undefined {
    player.game.defer(new SelectProductionToLoseDeferred(player, 2, 'Select 2 units of production to lose'));
    return undefined;
  }
}
