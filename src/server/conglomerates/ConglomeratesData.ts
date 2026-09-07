import {PlayerId} from '../../common/Types';

export type TeamActionCosts = {
  givePatent: number;
  facilitySharing: number;
  donation: number;
}

export type ConglomeratesTeam = {
  playerIds: Array<PlayerId>;
  teamActionCosts: TeamActionCosts;
  /** VP not attributed to an individual player, e.g. from winning a Turmoil ruling. */
  bonusVictoryPoints: number;
}

export type ConglomeratesData = {
  teams: Array<ConglomeratesTeam>;
}
