import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {DeltaProjectExpansion} from '../../delta/DeltaProjectExpansion';
import {DeltaProjectInput} from '../../delta/DeltaProjectInput';
import {digit} from '../Options';

/** Grants a second, independently-controlled marker on the Delta Project track, which can
 * also move backward - so a player with this corp can climb (and re-climb, after retreating
 * onto fresh ground) the track twice over. */
export class EpsilonDample extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.EPSILON_DAMPLE,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegaCredits: 28,

      behavior: {
        stock: {steel: 8, energy: 5},
        production: {energy: 1},
      },

      metadata: {
        cardNumber: 'DP02',
        description: 'You start with 28 M€, 8 steel, 5 energy, and 1 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(28).nbsp.steel(8, {digit}).nbsp.energy(5, {digit}).br;
          b.production((pb) => pb.energy(1)).br;
          b.corpBox('action', (ce) => {
            ce.action('Spend any amount of energy to move a second marker that many steps forward or backward on the Delta Project track. Forward movement follows the normal tag requirements and grants rewards; backward movement does not.', (ab) => {
              ab.text('X').energy(1).startAction.text('±X').plate('Delta track');
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.epsilonDampleData = {position: 0, jovianBonus: false, highestPosition: 0};
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    return DeltaProjectExpansion.getValidEpsilonAdvanceSteps(player).length > 0 ||
      DeltaProjectExpansion.getValidEpsilonRetreatSteps(player).length > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const canAdvance = DeltaProjectExpansion.getValidEpsilonAdvanceSteps(player).length > 0;
    const canRetreat = DeltaProjectExpansion.getValidEpsilonRetreatSteps(player).length > 0;

    const orOptions = new OrOptions();

    if (canAdvance) {
      orOptions.options.push(new SelectOption('Advance', 'Advance').andThen(() => {
        return new DeltaProjectInput(DeltaProjectExpansion.getValidEpsilonAdvanceSteps(player))
          .andThen((amount) => {
            DeltaProjectExpansion.advanceEpsilon(player, amount);
            return undefined;
          });
      }));
    }

    if (canRetreat) {
      orOptions.options.push(new SelectOption('Move backward', 'Move backward').andThen(() => {
        return new DeltaProjectInput(DeltaProjectExpansion.getValidEpsilonRetreatSteps(player), {reverse: true})
          .andThen((amount) => {
            DeltaProjectExpansion.retreatEpsilon(player, amount);
            return undefined;
          });
      }));
    }

    if (orOptions.options.length === 1) {
      return orOptions.options[0].cb();
    }
    return orOptions;
  }
}
