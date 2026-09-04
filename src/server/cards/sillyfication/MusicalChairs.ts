import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';

/** Blue card: spend 1 energy to randomly hand the first-player marker to another player. */
export class MusicalChairs extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MUSICAL_CHAIRS,
      cost: 4,

      metadata: {
        cardNumber: 'X73',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to make a random player other than the current first player the new first player.', (eb) => {
            eb.energy(1).startAction.firstPlayer().asterix();
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.energy >= 1 && player.game.players.length >= 2;
  }

  public action(player: IPlayer) {
    const game = player.game;
    player.stock.deduct(Resource.ENERGY, 1);
    const candidates = game.players.filter((p) => p.id !== game.first.id);
    const next = candidates[game.rng.nextInt(candidates.length)];
    game.log('${0} used ${1} to shuffle the turn order', (b) => b.player(player).card(this));
    game.overrideFirstPlayer(next);
    return undefined;
  }
}
