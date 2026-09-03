import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

/** Randomly hands the first-player marker to a different player. */
export class MusicalChairs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MUSICAL_CHAIRS,
      cost: 4,

      metadata: {
        cardNumber: 'X73',
        renderData: CardRenderer.builder((b) => {
          b.firstPlayer().asterix();
        }),
        description: 'Choose a random player other than the current first player to become the new first player.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.game.players.length >= 2;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const candidates = game.players.filter((p) => p.id !== game.first.id);
    const next = candidates[game.rng.nextInt(candidates.length)];
    game.log('${0} shuffled the turn order with ${1}', (b) => b.player(player).card(this));
    game.overrideFirstPlayer(next);
    return undefined;
  }
}
