import {PlayerId} from '../../common/Types';

export type TeamActionCosts = {
  givePatent: number;
  facilitySharing: number;
  donation: number;
}

export type ConglomeratesTeam = {
  playerIds: Array<PlayerId>;
  teamActionCosts: TeamActionCosts;
}

export type ConglomeratesData = {
  teams: Array<ConglomeratesTeam>;
}
