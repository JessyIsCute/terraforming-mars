import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {AssemblerExpansion} from '../../assembler/AssemblerExpansion';

/** The tags Assembler can put on a card, minus wild: candidates for "your most common tag". */
const CANDIDATES = [
  Tag.BUILDING, Tag.SPACE, Tag.EARTH, Tag.SCIENCE, Tag.VENUS, Tag.PLANT,
  Tag.POWER, Tag.MICROBE, Tag.JOVIAN, Tag.CITY, Tag.ANIMAL,
] as const;

export class SpecializedFabricator extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SPECIALIZED_FABRICATOR,
      tags: [Tag.BUILDING],
      cost: 5,

      metadata: {
        cardNumber: 'AS10',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1).text('+').tag(Tag.WILD).asterix();
        }),
        description: 'Assemble a new card into your hand that has your most common tag.',
      },
    });
  }

  /** The player's most common Assembler tag, or undefined if they have none. */
  public static mostCommonTag(player: IPlayer): Tag | undefined {
    let best: Tag | undefined;
    let bestCount = 0;
    for (const tag of CANDIDATES) {
      const n = player.tags.count(tag, 'raw');
      if (n > bestCount) {
        best = tag;
        bestCount = n;
      }
    }
    return best;
  }

  public override bespokePlay(player: IPlayer) {
    const tag = SpecializedFabricator.mostCommonTag(player);
    AssemblerExpansion.assembleIntoHand(player, 1, tag !== undefined ? {tags: [tag]} : {});
    return undefined;
  }
}
