import {IPlayer} from '../IPlayer';
import {ConglomeratesData, ConglomeratesTeam, TeamActionCosts} from './ConglomeratesData';
import {ConglomeratesPlayerData} from '../../common/conglomerates/ConglomeratesPlayerData';

export const TEAM_ACTION_BASE_COSTS: TeamActionCosts = {
  givePatent: 2,
  facilitySharing: 1,
  donation: 1,
};

export class ConglomeratesExpansion {
  private constructor() {}

  public static initializeEmpty(): ConglomeratesData {
    return {teams: []};
  }

  /**
   * Pairs players into teams. There's no team-assignment UI yet, so players
   * are paired by table order: with 4 players, seats 0&2 form one team and
   * seats 1&3 form the other. An odd player out (relevant only outside 2v2,
   * which isn't supported yet) is left teamless.
   */
  public static initialize(players: ReadonlyArray<IPlayer>): ConglomeratesData {
    const teams: Array<ConglomeratesTeam> = [];
    const half = Math.floor(players.length / 2);
    for (let i = 0; i < half; i++) {
      teams.push({
        playerIds: [players[i].id, players[i + half].id],
        teamActionCosts: {...TEAM_ACTION_BASE_COSTS},
      });
    }
    return {teams};
  }

  public static initializePlayer(): ConglomeratesPlayerData {
    return {coordination: 1};
  }

  public static getTeam(player: IPlayer): ConglomeratesTeam | undefined {
    return player.game.conglomerates.teams.find((team) => team.playerIds.includes(player.id));
  }

  public static teammates(player: IPlayer): ReadonlyArray<IPlayer> {
    const team = this.getTeam(player);
    if (team === undefined) {
      return [];
    }
    return team.playerIds
      .filter((id) => id !== player.id)
      .map((id) => player.game.getPlayerById(id));
  }

  public static gainCoordination(player: IPlayer, count: number, options?: {log: boolean}) {
    player.conglomeratesData.coordination += count;
    if (options?.log === true) {
      player.game.log('${0} gained ${1} coordination', (b) => b.player(player).number(count));
    }
  }

  public static spendCoordination(player: IPlayer, count: number, options?: {log: boolean}) {
    player.conglomeratesData.coordination -= count;
    if (options?.log === true) {
      player.game.log('${0} spent ${1} coordination', (b) => b.player(player).number(count));
    }
  }

  public static getTeamActionCost(player: IPlayer, action: keyof TeamActionCosts): number {
    const team = this.getTeam(player);
    return team?.teamActionCosts[action] ?? TEAM_ACTION_BASE_COSTS[action];
  }

  /** Raises `action`'s cost by 1 for both members of `player`'s team, for the rest of the game. */
  public static increaseTeamActionCost(player: IPlayer, action: keyof TeamActionCosts) {
    const team = this.getTeam(player);
    if (team === undefined) {
      return;
    }
    team.teamActionCosts[action] += 1;
  }
}
