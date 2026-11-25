import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {AssemblerExpansion} from '../../assembler/AssemblerExpansion';
import {DiscardCards} from '../../deferredActions/DiscardCards';

export class ResearchPrototype extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.RESEARCH_PROTOTYPE,
      tags: [Tag.SCIENCE],
      cost: 3,

      metadata: {
        cardNumber: 'AS05',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1).tag(Tag.SCIENCE).asterix().nbsp.minus().cards(1);
        }),
        description: 'Assemble a new card with at least 1 science tag into your hand, then discard a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    AssemblerExpansion.assembleIntoHand(player, 1, {tags: [Tag.SCIENCE]});
    player.game.defer(new DiscardCards(player, 1, 1));
    return undefined;
  }
}
