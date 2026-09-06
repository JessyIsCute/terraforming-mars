import {IPlayer} from '../../IPlayer';
import {InequalityRequirement} from './InequalityRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';

/** Evaluate whether the player has ever played at least (or at most) N cards costing 25 M€ or more. */
export class ExpensiveCardsPlayedRequirement extends InequalityRequirement {
  public readonly type = RequirementType.EXPENSIVE_CARDS_PLAYED;
  public getScore(player: IPlayer): number {
    return player.expensiveCardsPlayed;
  }
}
