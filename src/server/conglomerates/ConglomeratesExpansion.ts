import {IPlayer} from '../IPlayer';
import {IGame} from '../IGame';
import {PlayerId} from '../../common/Types';
import {ConglomeratesData, ConglomeratesTeam, TeamActionCosts} from './ConglomeratesData';
import {ConglomeratesPlayerData} from '../../common/conglomerates/ConglomeratesPlayerData';
import {AwardScorer} from '../awards/AwardScorer';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {sum} from '../../common/utils/utils';
import {TeamVictoryPointsBreakdown} from '../../common/conglomerates/TeamVictoryPointsBreakdown';
import {ConglomeratesTeamModel} from '../../common/models/ConglomeratesModel';

const MILESTONE_TEAM_VP = 8;
const AWARD_TEAM_VP = 8;

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
    // player.game is unset for some bare, gameless test players -- treat that as teamless.
    return player.game?.conglomerates?.teams.find((team) => team.playerIds.includes(player.id));
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

  /** `player`'s team, as player ids including `player`. A teamless player is their own team of one. */
  public static teamPlayerIds(player: IPlayer): ReadonlyArray<PlayerId> {
    return this.getTeam(player)?.playerIds ?? [player.id];
  }

  /**
   * Groups every player in the game into a team (playerIds), pairing teamless players
   * into solo teams of one so award ranking still works for them.
   */
  private static allTeamGroups(game: IGame): Array<ReadonlyArray<PlayerId>> {
    const grouped = new Set<PlayerId>();
    const groups: Array<ReadonlyArray<PlayerId>> = [];
    for (const player of game.players) {
      if (grouped.has(player.id)) {
        continue;
      }
      const ids = this.teamPlayerIds(player);
      ids.forEach((id) => grouped.add(id));
      groups.push(ids);
    }
    return groups;
  }

  /**
   * A milestone/award threshold check, scaled 1.5x (rounded up) and evaluated against the
   * combined score of `player`'s whole team, when Conglomerates is on and `player` has a
   * teammate. Otherwise, behaves like the unscaled single-player check.
   */
  public static meetsTeamThreshold(player: IPlayer, threshold: number, getScore: (player: IPlayer) => number): boolean {
    // A team can only exist inside a real game, so checking teammates first (which tolerates a
    // gameless player) avoids dereferencing player.game before we know it's actually set.
    const teammates = player.teammates();
    if (teammates.length === 0 || !player.game.gameOptions.conglomeratesExpansion) {
      return getScore(player) >= threshold;
    }
    const combined = getScore(player) + sum(teammates.map(getScore));
    return combined >= Math.ceil(threshold * 1.5);
  }

  /**
   * Replaces the base game's per-player milestone/award VP for a Conglomerates game: each
   * claimed milestone pays 8 VP to the claimer's whole team (not just the claimer), and each
   * funded award pays 8 VP win-take-all to whichever team has the highest combined score
   * (ties all win). The Coordination reward for claiming/funding is granted separately, at
   * the point of claiming/funding -- this only covers the VP side of the reward.
   */
  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder) {
    const game = player.game;
    if (game.isSoloMode()) {
      return;
    }
    const myTeam = this.teamPlayerIds(player);

    for (const claimed of game.claimedMilestones) {
      if (claimed.player !== undefined && myTeam.includes(claimed.player.id)) {
        builder.setVictoryPoints('milestones', MILESTONE_TEAM_VP, 'Team claimed ${0} milestone', [claimed.milestone.name]);
      }
    }

    for (const fundedAward of game.fundedAwards) {
      const scorer = new AwardScorer(game, fundedAward.award);
      const teamScores = this.allTeamGroups(game).map((playerIds) => ({
        playerIds,
        score: sum(playerIds.map((id) => scorer.get(game.getPlayerById(id)))),
      }));
      const topScore = Math.max(...teamScores.map((t) => t.score));
      const wonByMyTeam = teamScores.some((t) => t.score === topScore && t.playerIds.includes(player.id));
      if (wonByMyTeam) {
        builder.setVictoryPoints('awards', AWARD_TEAM_VP, 'Team won ${0} award (funded by ${1})', [fundedAward.award.name, fundedAward.player.name]);
      }
    }
  }

  /**
   * The live team scoreboard: each member's personal VP (their own total, with the
   * milestones/awards categories subtracted out -- those are already the *team's* full
   * milestone/award VP, identically duplicated onto every member's own breakdown by
   * `calculateVictoryPoints` above, so summing members' raw totals would double-count them),
   * plus the team's milestone and award VP counted once, plus a `bonuses` category reserved
   * for future team-only VP sources (e.g. the Turmoil ruling bonus, not yet implemented).
   */
  public static calculateTeamVictoryPoints(game: IGame, team: ConglomeratesTeam): TeamVictoryPointsBreakdown {
    const memberBreakdowns = team.playerIds.map((id) => game.getPlayerById(id).getVictoryPoints());
    const players = sum(memberBreakdowns.map((vp) => vp.total - vp.milestones - vp.awards));
    const milestones = memberBreakdowns[0]?.milestones ?? 0;
    const awards = memberBreakdowns[0]?.awards ?? 0;
    const bonuses = 0;
    return {
      players,
      milestones,
      awards,
      bonuses,
      total: players + milestones + awards + bonuses,
    };
  }

  public static getTeamModels(game: IGame): Array<ConglomeratesTeamModel> {
    if (!game.gameOptions.conglomeratesExpansion) {
      return [];
    }
    return game.conglomerates.teams.map((team, index) => {
      const members = team.playerIds.map((id) => game.getPlayerById(id));
      return {
        id: `team-${index + 1}`,
        playerIds: [...team.playerIds],
        playerColors: members.map((member) => member.color),
        name: members.map((member) => member.name).join(' & '),
        victoryPoints: this.calculateTeamVictoryPoints(game, team),
      };
    });
  }
}
