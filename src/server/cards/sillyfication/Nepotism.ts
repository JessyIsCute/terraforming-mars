import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {Turmoil} from '../../turmoil/Turmoil';
import {CardRenderer} from '../render/CardRenderer';

/** Permanently adds 2 delegates to your reserve (7 -> 9). */
export class Nepotism extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.NEPOTISM,
      cost: 10,

      metadata: {
        cardNumber: 'X70',
        renderData: CardRenderer.builder((b) => {
          b.plus().delegates(2);
        }),
        description: 'Add 2 delegates to your reserve for the rest of the game (from 7 to 9).',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Turmoil.ifTurmoil(player.game, (turmoil) => {
      turmoil.delegateReserve.add(player, 2);
      player.game.log('${0} added 2 delegates to their reserve', (b) => b.player(player));
    });
    return undefined;
  }
}
