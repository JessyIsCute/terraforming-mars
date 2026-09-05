import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class Blockhouse extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BLOCKHOUSE,
      tags: [Tag.BUILDING],
      cost: 10,
      victoryPoints: 1,

      behavior: {
        // The DSL only supports a +1 step, so the second step is applied in bespokePlay.
        steelValue: 1,
      },

      metadata: {
        cardNumber: 'T34',
        renderData: CardRenderer.builder((b) => {
          b.effect('Each steel you have is worth 2 M€ extra. Steel may be used to pay for the CITY STANDARD PROJECT.', (eb) => {
            eb.steel(1).startEffect.plus(Size.SMALL).megacredits(2);
          });
        }),
        description: 'Each steel you have is worth 2 M€ extra, and steel may be used to pay for the City standard project.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.increaseSteelValue();
    return undefined;
  }

  public override onDiscard(player: IPlayer) {
    player.decreaseSteelValue();
  }
}
