import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {message} from '../../logs/MessageBuilder';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class ChipFabricationPlant extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CHIP_FABRICATION_PLANT,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 15,

      requirements: {tag: Tag.PLANT, count: 1, max: true},

      metadata: {
        cardNumber: 'X40',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend any number of M€ to gain the same amount of steel (max is the number of building tags you have).', (ab) => {
            ab.text('X').megacredits(1, {secondaryTag: Tag.BUILDING}).startAction.text('X').steel(1);
          });
        }),
        description: 'Requires that you have no more than 1 plant tag.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.tags.count(Tag.BUILDING) > 0 && player.megaCredits > 0;
  }

  public action(player: IPlayer) {
    const max = Math.min(player.tags.count(Tag.BUILDING), player.megaCredits);
    return new SelectAmount(
      message('Select up to ${0} M€ to convert to steel', (b) => b.number(max)),
      'Convert M€', 1, max, false)
      .andThen((amount) => {
        player.stock.deduct(Resource.MEGACREDITS, amount);
        player.stock.add(Resource.STEEL, amount);
        player.game.log('${0} converted ${1} M€ to steel', (b) => b.player(player).number(amount));
        return undefined;
      });
  }
}
