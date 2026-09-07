import {PlayerId} from '../Types';
import {Color} from '../Color';
import {TeamVictoryPointsBreakdown} from '../conglomerates/TeamVictoryPointsBreakdown';

export type ConglomeratesTeamModel = {
  id: string;
  playerIds: Array<PlayerId>;
  playerColors: Array<Color>;
  name: string;
  victoryPoints: TeamVictoryPointsBreakdown;
}

export type ConglomeratesModel = {
  teams: Array<ConglomeratesTeamModel>;
}
