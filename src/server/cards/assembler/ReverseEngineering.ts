import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {AssemblerExpansion} from '../../assembler/AssemblerExpansion';
import {DiscardCards} from '../../deferredActions/DiscardCards';

export class ReverseEngineering extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.REVERSE_ENGINEERING,
      tags: [Tag.SCIENCE],
      cost: 7,

      metadata: {
        cardNumber: 'AS09',
        renderData: CardRenderer.builder((b) => {
          b.action('Discard a card from your hand to Assemble a new card into your hand.', (eb) => {
            eb.minus().cards(1).startAction.assemble(1);
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.cardsInHand.length > 0;
  }

  public action(player: IPlayer) {
    player.game.defer(new DiscardCards(player, 1, 1, 'Select a card to discard for Reverse Engineering'))
      .andThen(() => AssemblerExpansion.assembleIntoHand(player, 1));
    return undefined;
  }
}
