import {PlayerId} from '../Types';
import {Color} from '../Color';
import {TeamVictoryPointsBreakdown} from '../conglomerates/TeamVictoryPointsBreakdown';

export type ConglomeratesTeamModel = {
  id: string;
  playerIds: Array<PlayerId>;
  playerColors: Array<Color>;
  /** Each member's own personal VP total, same order as playerIds/playerColors. */
  memberScores: Array<number>;
  name: string;
  victoryPoints: TeamVictoryPointsBreakdown;
}

export type ConglomeratesModel = {
  teams: Array<ConglomeratesTeamModel>;
}
