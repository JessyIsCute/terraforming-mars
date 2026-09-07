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
import {IParty} from '../turmoil/parties/IParty';
import {Color, PLAYER_COLORS} from '../../common/Color';
import {CardName} from '../../common/cards/CardName';

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
        bonusVictoryPoints: 0,
      });
    }
    return {teams};
  }

  public static initializePlayer(): ConglomeratesPlayerData {
    return {coordination: 0};
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

  /**
   * True when `spacePlayer` (the owner of a board space, or undefined for an unowned one) is
   * `player` or one of their teammates. Used to extend "adjacent to your own tile"
   * placement-legality checks (base-game greenery, Mining Area, Arcadian Communities, Kingdom
   * of Tauraro) to a teammate's tiles -- never for adjacency-triggered bonus payouts, which
   * only ever count the acting player's own tiles.
   */
  public static isTeammateOrSelf(player: IPlayer, spacePlayer: IPlayer | undefined): boolean {
    if (spacePlayer === undefined) {
      return false;
    }
    if (spacePlayer.id === player.id) {
      return true;
    }
    return this.teammates(player).some((teammate) => teammate.id === spacePlayer.id);
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

  /** Raises `action`'s cost by 1 for both members of `player`'s team, for the rest of the generation. */
  public static increaseTeamActionCost(player: IPlayer, action: keyof TeamActionCosts) {
    const team = this.getTeam(player);
    if (team === undefined) {
      return;
    }
    team.teamActionCosts[action] += 1;
  }

  /**
   * Resets `player`'s team's Team Action costs back to base at the start of a new
   * generation's production phase. Called once per team member (harmless -- resetting to
   * the same base values twice is a no-op), from `Player.finishProductionPhase()`.
   */
  public static resetTeamActionCosts(player: IPlayer) {
    const team = this.getTeam(player);
    if (team === undefined) {
      return;
    }
    team.teamActionCosts = {...TEAM_ACTION_BASE_COSTS};
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
   * plus the team's milestone and award VP counted once, plus `bonuses` -- VP not attributed
   * to an individual player, such as winning a Turmoil ruling (see `rewardRulingTeam`).
   */
  public static calculateTeamVictoryPoints(game: IGame, team: ConglomeratesTeam): TeamVictoryPointsBreakdown {
    const memberBreakdowns = team.playerIds.map((id) => game.getPlayerById(id).getVictoryPoints());
    const players = sum(memberBreakdowns.map((vp) => vp.total - vp.milestones - vp.awards));
    const milestones = memberBreakdowns[0]?.milestones ?? 0;
    const awards = memberBreakdowns[0]?.awards ?? 0;
    const bonuses = team.bonusVictoryPoints ?? 0;
    return {
      players,
      milestones,
      awards,
      bonuses,
      total: players + milestones + awards + bonuses,
    };
  }

  /**
   * Called when `party` becomes the new ruling party (Turmoil.setRulingParty, before its
   * delegates are returned to reserve). Groups the party's delegates by team; if exactly one
   * team holds a strict plurality (more than any other single team, ties excluded), that team
   * "won the ruling": both members gain 1 Coordination, and the team gains 1 VP (`bonuses`).
   */
  public static rewardRulingTeam(game: IGame, party: IParty) {
    const teamDelegateCounts = new Map<ConglomeratesTeam, number>();
    party.delegates.forEachMultiplicity((count, delegate) => {
      if (delegate === 'NEUTRAL') {
        return;
      }
      const team = this.getTeam(delegate);
      if (team === undefined) {
        return;
      }
      teamDelegateCounts.set(team, (teamDelegateCounts.get(team) ?? 0) + count);
    });
    if (teamDelegateCounts.size === 0) {
      return;
    }

    const sorted = [...teamDelegateCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topCount = sorted[0][1];
    if (sorted.length > 1 && sorted[1][1] === topCount) {
      // Tied for the lead -- no team clearly won the ruling.
      return;
    }
    const [winningTeam] = sorted[0];

    winningTeam.bonusVictoryPoints = (winningTeam.bonusVictoryPoints ?? 0) + 1;
    game.log('A team won the ${0} ruling, gaining 1 Coordination each and 1 team VP', (b) => b.partyName(party.name));
    for (const playerId of winningTeam.playerIds) {
      this.gainCoordination(game.getPlayerById(playerId), 1, {log: true});
    }
  }

  /**
   * The shared delegate color for `player`'s team in Turmoil: one of the 8 standard
   * `PLAYER_COLORS` that no player in this game is actually using, assigned by team index --
   * no new colors needed. Undefined if `player` is teamless, or if every color is already
   * taken by an actual player (not possible in 2v2, but a graceful fallback for larger games).
   */
  public static teamDisplayColor(player: IPlayer): Color | undefined {
    const game = player.game;
    const teams = game?.conglomerates?.teams;
    if (teams === undefined) {
      return undefined;
    }
    const index = teams.findIndex((team) => team.playerIds.includes(player.id));
    if (index === -1) {
      return undefined;
    }
    const usedColors = new Set(game.players.map((p) => p.color));
    const availableColors = PLAYER_COLORS.filter((color) => !usedColors.has(color));
    return availableColors[index];
  }

  /**
   * How much of `player`'s still-uncovered negative VP (after their own Underworld corruption
   * bribe, `ownBribe`) a teammate's leftover corruption can offset. A teammate only has
   * leftover corruption once their own negative VP is fully covered by their own corruption
   * (see `calculateNegativeVP`), so a player who themselves needs help can never simultaneously
   * have leftover to give -- this can't double-count or go in circles.
   */
  public static teammateCorruptionAssist(player: IPlayer, negativeVP: number, ownBribe: number): number {
    let remaining = Math.abs(negativeVP) - ownBribe;
    if (remaining <= 0) {
      return 0;
    }
    let assist = 0;
    for (const teammate of player.teammates()) {
      const teammateNegativeVP = this.negativeVPForCorruptionSharing(teammate);
      const teammateOwnBribe = Math.min(Math.abs(teammateNegativeVP), teammate.underworldData.corruption);
      const leftover = teammate.underworldData.corruption - teammateOwnBribe;
      const contribution = Math.min(remaining, leftover);
      assist += contribution;
      remaining -= contribution;
      if (remaining <= 0) {
        break;
      }
    }
    return assist;
  }

  /**
   * A copy of `calculateVictoryPoints.ts`'s private `calculateNegativeVP` (cards' negative VP
   * plus the Vermin penalty). Not imported from there: that file already imports this one (for
   * `calculateVictoryPoints` above), and importing back would create a two-file cycle that
   * crashes at module load ("cannot access before initialization") rather than just at
   * typecheck time -- so this small, stable calculation is duplicated instead.
   */
  private static negativeVPForCorruptionSharing(player: IPlayer): number {
    let negativeVP = 0;
    let playerOwnsVermin = false;
    for (const playedCard of player.tableau) {
      if (playedCard.victoryPoints !== undefined) {
        const vp = playedCard.getVictoryPoints(player);
        if (vp < 0) {
          negativeVP += vp;
        }
      }
      playerOwnsVermin ||= playedCard.name === CardName.VERMIN;
    }
    if (player.game.verminInEffect && playerOwnsVermin === false) {
      negativeVP -= player.game.board.getCities(player).length;
    }
    return negativeVP;
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
