import {PreludeCard} from '../prelude/PreludeCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';

export class GenerousRedistribution extends PreludeCard {
  constructor() {
    super({
      name: CardName.GENEROUS_REDISTRIBUTION,

      metadata: {
        cardNumber: 'T13',
        renderData: CardRenderer.builder((b) => {
          b.tr(3, {all}).plants(2, {all}).cards(1, {all}).br;
          b.text('you get twice that').colon().tr(6).plants(4, {digit}).cards(2);
        }),
        description: 'Every player gains 3 TR, 2 plants, and 1 card. You gain twice as much of each.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      const mult = p.id === player.id ? 2 : 1;
      p.increaseTerraformRating(3 * mult, {log: true});
      p.stock.add(Resource.PLANTS, 2 * mult, {log: true});
      p.drawCard(1 * mult);
    }
    return undefined;
  }
}
