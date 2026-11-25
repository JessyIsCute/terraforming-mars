import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardRenderItem} from '../render/CardRenderItem';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {isAssembledCardName} from '../../assembler/AssembledCardRegistry';

export class HallOfPrototypes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HALL_OF_PROTOTYPES,
      tags: [Tag.BUILDING],
      cost: 7,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'AS13',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP for every 2 assembled cards you have played, events included.');
        }),
        victoryPoints: {
          item: new CardRenderItem(CardRenderItemType.ASSEMBLE, 1),
          points: 1,
          target: 2,
        },
      },
    });
  }

  public static assembledPlayed(player: IPlayer): number {
    return player.playedCards.asArray().filter((c) => isAssembledCardName(c.name)).length;
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor(HallOfPrototypes.assembledPlayed(player) / 2);
  }
}
