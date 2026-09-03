import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

// Venus is the goddess of love, so a joint Venus/Earth subsidiary is, obviously, a love child.
export class LoveChildHoldings extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LOVE_CHILD_HOLDINGS,
      tags: [Tag.VENUS, Tag.EARTH],
      cost: 10,
      requirements: [{tag: Tag.VENUS, count: 2}, {tag: Tag.EARTH, count: 2}],

      metadata: {
        cardNumber: 'X07',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 M€ for each pair of Venus and Earth tags you have (1 Venus + 1 Earth = 1 pair).', (eb) => {
            eb.empty().startAction.megacredits(1).slash().tag(Tag.VENUS).tag(Tag.EARTH);
          });
        }),
        description: 'Requires 2 Venus tags and 2 Earth tags.',
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    const pairs = Math.min(player.tags.count(Tag.VENUS), player.tags.count(Tag.EARTH));
    player.stock.add(Resource.MEGACREDITS, pairs, {log: true});
    return undefined;
  }
}
