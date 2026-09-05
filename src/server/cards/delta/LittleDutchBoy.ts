import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../IProjectCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPlayer} from '../../inputs/SelectPlayer';

// Simplified from the concept art: rather than a separate resource pool that "also counts
// as steel" (which the original text implies is fungible with real steel anyway), this just
// adds/spends real steel directly.
export class LittleDutchBoy extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LITTLE_DUTCH_BOY,
      cost: 7,

      metadata: {
        cardNumber: 'DP09',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 steel. OR: Spend 1 steel to block another player\'s Delta Project marker from advancing for the rest of this generation.', (ab) => {
            ab.empty().startAction.steel(1);
          });
        }),
        description: 'The blockade is removed at the start of the next generation.',
      },
    });
  }

  private blockableOpponents(player: IPlayer): ReadonlyArray<IPlayer> {
    return player.opponents.filter((p) => p.deltaProjectData !== undefined && p.deltaProjectData.blocked !== true);
  }

  public canAct(_player: IPlayer): boolean {
    return true; // Gaining 1 steel is always available.
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const targets = this.blockableOpponents(player);

    const gainSteel = new SelectOption('Gain 1 steel', 'Gain steel').andThen(() => {
      player.stock.add(Resource.STEEL, 1, {log: true, from: {card: this}});
      return undefined;
    });

    if (player.steel < 1 || targets.length === 0) {
      return gainSteel.cb(undefined);
    }

    const block = new SelectOption('Spend 1 steel to block an opponent\'s Delta Project marker', 'Block').andThen(() => {
      return new SelectPlayer(targets, 'Select player to block', 'Block').andThen((target) => {
        const targetData = target.deltaProjectData;
        if (targetData === undefined) {
          return undefined;
        }
        player.stock.deduct(Resource.STEEL, 1);
        targetData.blocked = true;
        player.game.log('${0} blocked ${1}\'s Delta Project marker for the rest of this generation', (b) => b.player(player).player(target));
        return undefined;
      });
    });

    return new OrOptions(gainSteel, block);
  }
}
