import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {ICard} from '../ICard';
import {isAssembledCardName} from '../../assembler/AssembledCardRegistry';

export class SalvageYard extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SALVAGE_YARD,
      tags: [Tag.BUILDING],
      cost: 7,

      behavior: {
        assemble: 3,
      },

      metadata: {
        cardNumber: 'AS03',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an assembled card, gain 2 M€.', (eb) => {
            eb.assemble(1).startEffect.megacredits(2);
          }).br;
          b.assemble(3);
        }),
        description: 'Assemble 3 new cards into the deck.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (isAssembledCardName(card.name)) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
  }
}
