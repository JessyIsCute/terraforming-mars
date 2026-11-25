import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {isAssembledCardName} from '../../assembler/AssembledCardRegistry';

export class AssemblyRobots extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ASSEMBLY_ROBOTS,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 10,

      behavior: {
        assemble: {count: 1, into: 'hand'},
      },

      metadata: {
        cardNumber: 'AS08',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an assembled card, you pay 2 M€ less for it.', (eb) => {
            eb.assemble(1).startEffect.megacredits(-2);
          }).br;
          b.assemble(1);
        }),
        description: 'Assemble a new card into your hand.',
      },
    });
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    return super.getCardDiscount(player, card) + (isAssembledCardName(card.name) ? 2 : 0);
  }
}
