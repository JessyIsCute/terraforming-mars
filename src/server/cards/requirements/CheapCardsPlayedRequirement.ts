import {IPlayer} from '../../IPlayer';
import {InequalityRequirement} from './InequalityRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';

/** Evaluate whether the player has ever played at least (or at most) N cards costing less than 7 M€. */
export class CheapCardsPlayedRequirement extends InequalityRequirement {
  public readonly type = RequirementType.CHEAP_CARDS_PLAYED;
  public getScore(player: IPlayer): number {
    return player.cheapCardsPlayed;
  }
}
