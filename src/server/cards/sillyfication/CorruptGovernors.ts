import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {Turmoil} from '../../turmoil/Turmoil';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class CorruptGovernors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CORRUPT_GOVERNORS,
      cost: 16,

      requirements: {chairman: true},

      metadata: {
        cardNumber: 'X49',
        renderData: CardRenderer.builder((b) => {
          b.influence({amount: 2, all}).br;
          b.plus().influence({amount: 2});
        }),
        description: 'Requires that you are Chairman. Increase all players\' influence 2 steps. Increase your influence 2 additional steps.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Turmoil.ifTurmoil(player.game, (turmoil) => {
      for (const p of player.game.playersInGenerationOrder) {
        turmoil.addInfluenceBonus(p, 2);
      }
      turmoil.addInfluenceBonus(player, 2);
    });
    return undefined;
  }
}
