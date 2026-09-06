import {IPlayer} from '../../IPlayer';
import {InequalityRequirement} from './InequalityRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';

/** Evaluate whether the player's current same-generation run of strictly-cheaper-each-time played cards is at least (or at most) N long. */
export class CardCostStreakRequirement extends InequalityRequirement {
  public readonly type = RequirementType.CARD_COST_STREAK;
  public getScore(player: IPlayer): number {
    return player.cardCostStreak;
  }
}
