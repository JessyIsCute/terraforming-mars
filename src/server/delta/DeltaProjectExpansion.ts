import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {DeltaProjectPlayerModel} from '../../common/models/DeltaProjectPlayerModel';
import {CardName} from '../../common/cards/CardName';
import {Tag} from '../../common/cards/Tag';
import {Resource} from '../../common/Resource';
import {SelectOption} from '../inputs/SelectOption';
import {SelectCard} from '../inputs/SelectCard';
import {OrOptions} from '../inputs/OrOptions';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {DrawCards} from '../deferredActions/DrawCards';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {CardResource} from '../../common/CardResource';
import {IActionCard, ICard, isIActionCard, isIHasCheckLoops} from '../cards/ICard';

/**
 * The ordered tags for each track position (1-indexed).
 * Position 0 is the starting position (no tag).
 * Positions 10 and 11 are the 2VP and 5VP spots (no tag requirement).
 */
export const DELTA_TRACK_TAGS: ReadonlyArray<Tag | undefined> = [
  undefined,     // 0: start
  Tag.BUILDING,  // 1
  Tag.POWER,     // 2
  Tag.EARTH,     // 3
  Tag.SPACE,     // 4
  Tag.SCIENCE,   // 5
  Tag.PLANT,     // 6
  Tag.MICROBE,   // 7
  Tag.JOVIAN,    // 8
  Tag.ANIMAL,    // 9
  undefined,     // 10: 2VP
  undefined,     // 11: 5VP
] as const;

export const VP2_POSITION = 10;
export const VP5_POSITION = 11;

export const MAX_TRACK_POSITION = DELTA_TRACK_TAGS.length - 1; // 11 (positions 0–11)

/** Which marker on the Delta Project track is being referred to. Every player has a
 * `primary` marker (from the always-dealt Delta Project prelude); `epsilon` is the
 * second marker granted by the Epsilon Dample corporation. */
export type MarkerKind = 'primary' | 'epsilon';

export class DeltaProjectExpansion {
  private constructor() {}

  private static getProgress(player: IPlayer): DeltaProjectPlayerModel {
    return DeltaProjectExpansion.getMarkerData(player, 'primary');
  }

  private static getMarkerData(player: IPlayer, marker: MarkerKind): DeltaProjectPlayerModel {
    const data = marker === 'primary' ? player.deltaProjectData : player.epsilonDampleData;
    if (data === undefined) {
      throw new Error(`No ${marker} Delta Project progress for player ` + player.color);
    }
    return data;
  }

  // True if some marker other than (`excludePlayer`, `excludeMarker`) occupies this track
  // position - including the *other* marker belonging to `excludePlayer` themselves, so a
  // player can't stack both of their own markers on the same VP spot.
  private static isOccupiedByOther(game: IGame, position: number, excludePlayer: IPlayer, excludeMarker: MarkerKind): boolean {
    for (const p of game.players) {
      const isExcludedPlayer = p === excludePlayer;
      if (p.deltaProjectData?.position === position && !(isExcludedPlayer && excludeMarker === 'primary')) {
        return true;
      }
      if (p.epsilonDampleData?.position === position && !(isExcludedPlayer && excludeMarker === 'epsilon')) {
        return true;
      }
    }
    return false;
  }

  // Whether the player has enough tags (using wilds to fill gaps) to reach targetPos.
  private static canReachPosition(player: IPlayer, targetPos: number): boolean {
    let missing = 0;
    for (let pos = 1; pos <= Math.min(targetPos, 9); pos++) {
      const tag = DELTA_TRACK_TAGS[pos];
      if (tag !== undefined && player.tags.count(tag, 'raw') === 0) {
        missing++;
      }
    }
    return missing <= player.tags.count(Tag.WILD, 'raw');
  }

  /**
   * Returns the allowed values for `advance(player, steps)` from the current position: each array
   * element is one legal `steps` argument (energy spent equals steps; landing passes tag checks and VP occupancy).
   * For example `[1, 2, 3]` when several jump sizes work, or `[2]` when only a two-step jump ends on a legal space.
   * Returns an empty array when no advance is possible.
   */
  public static getValidAdvanceSteps(player: IPlayer): ReadonlyArray<number> {
    return DeltaProjectExpansion.computeValidAdvanceSteps(player, 'primary');
  }

  /** Same as {@link getValidAdvanceSteps}, but for Epsilon Dample's second marker. */
  public static getValidEpsilonAdvanceSteps(player: IPlayer): ReadonlyArray<number> {
    return DeltaProjectExpansion.computeValidAdvanceSteps(player, 'epsilon');
  }

  private static computeValidAdvanceSteps(player: IPlayer, marker: MarkerKind): ReadonlyArray<number> {
    const game = player.game;
    const progress = DeltaProjectExpansion.getMarkerData(player, marker);
    const currentPos = progress.position;

    if (currentPos >= MAX_TRACK_POSITION) {
      return [];
    }

    const result: number[] = [];
    const maxByEnergy = Math.min(player.energy, MAX_TRACK_POSITION - currentPos);

    for (let steps = 1; steps <= maxByEnergy; steps++) {
      const newPos = currentPos + steps;
      if (newPos > MAX_TRACK_POSITION) {
        break;
      }

      if (!DeltaProjectExpansion.canReachPosition(player, newPos)) {
        continue;
      }

      if ((newPos === VP2_POSITION || newPos === VP5_POSITION) &&
        DeltaProjectExpansion.isOccupiedByOther(game, newPos, player, marker)) {
        continue;
      }
      result.push(steps);
    }
    return result;
  }

  /**
   * Returns the allowed values for `retreatEpsilon(player, steps)`: how far Epsilon
   * Dample's second marker can move backward. Unlike advancing, retreating has no tag
   * requirement, and never re-triggers a position's reward - it's a repositioning tool,
   * not a way to farm rewards by shuttling back and forth.
   */
  public static getValidEpsilonRetreatSteps(player: IPlayer): ReadonlyArray<number> {
    const game = player.game;
    const progress = DeltaProjectExpansion.getMarkerData(player, 'epsilon');
    const maxSteps = Math.min(player.energy, progress.position);

    const result: number[] = [];
    for (let steps = 1; steps <= maxSteps; steps++) {
      const newPos = progress.position - steps;
      if ((newPos === VP2_POSITION || newPos === VP5_POSITION) &&
        DeltaProjectExpansion.isOccupiedByOther(game, newPos, player, 'epsilon')) {
        continue;
      }
      result.push(steps);
    }
    return result;
  }

  /**
   * Highest legal step count. Not every integer 1..maxSteps is valid when VP
   * spaces are blocked (use {@link DeltaProjectExpansion.getValidAdvanceSteps} for the full list).
   * Returns 0 when no advance is possible.
   *
   * Constraints:
   * - Must have the required tag (raw, without wilds) for each step, OR use a wild tag.
   * - Each wild tag covers exactly one missing tag.
   * - Must have enough energy (1 per step).
   * - Cannot land on position VP spots if another player already occupies that position.
   * - Cannot move beyond position 11 (5VP).
   */
  public static maxSteps(player: IPlayer): number {
    const steps = DeltaProjectExpansion.getValidAdvanceSteps(player);
    return steps.length === 0 ? 0 : Math.max(...steps);
  }

  /** Same as {@link maxSteps}, but for Epsilon Dample's second marker. */
  public static maxEpsilonSteps(player: IPlayer): number {
    const steps = DeltaProjectExpansion.getValidEpsilonAdvanceSteps(player);
    return steps.length === 0 ? 0 : Math.max(...steps);
  }

  public static advance(player: IPlayer, steps: number): void {
    const valid = DeltaProjectExpansion.getValidAdvanceSteps(player);
    if (!valid.includes(steps)) {
      throw new Error(`Invalid Delta Project advance: ${String(steps)} step(s) (valid: ${valid.join(', ')})`);
    }

    const progress = DeltaProjectExpansion.getProgress(player);
    const currentPos = progress.position;
    const newPos = currentPos + steps;

    player.stock.deduct(Resource.ENERGY, steps);
    progress.position = newPos;

    DeltaProjectExpansion.resolveReward(player, newPos, 'primary');

    player.game.log('${0} spend ${1} energy to advance on the Delta Project track', (b) => b.player(player).number(steps));
  }

  /** Advance Epsilon Dample's second marker. Grants the landing position's reward, like
   * {@link advance} - but see {@link maybeResolveEpsilonReward} for the one-claim-per-position
   * rule that keeps this (and {@link retreatEpsilon}) from being a farming loop. */
  public static advanceEpsilon(player: IPlayer, steps: number): void {
    const valid = DeltaProjectExpansion.getValidEpsilonAdvanceSteps(player);
    if (!valid.includes(steps)) {
      throw new Error(`Invalid Epsilon Dample advance: ${String(steps)} step(s) (valid: ${valid.join(', ')})`);
    }

    const progress = DeltaProjectExpansion.getMarkerData(player, 'epsilon');
    const newPos = progress.position + steps;

    player.stock.deduct(Resource.ENERGY, steps);
    progress.position = newPos;
    DeltaProjectExpansion.maybeResolveEpsilonReward(player, newPos);

    player.game.log('${0} spent ${1} energy to advance their second marker on the Delta Project track', (b) => b.player(player).number(steps));
  }

  /** Move Epsilon Dample's second marker backward. Costs 1 energy per step, same as
   * advancing, and also grants the landing position's reward if this marker has never
   * claimed it before (see {@link maybeResolveEpsilonReward}). */
  public static retreatEpsilon(player: IPlayer, steps: number): void {
    const valid = DeltaProjectExpansion.getValidEpsilonRetreatSteps(player);
    if (!valid.includes(steps)) {
      throw new Error(`Invalid Epsilon Dample retreat: ${String(steps)} step(s) (valid: ${valid.join(', ')})`);
    }

    const progress = DeltaProjectExpansion.getMarkerData(player, 'epsilon');
    const newPos = progress.position - steps;

    player.stock.deduct(Resource.ENERGY, steps);
    progress.position = newPos;
    DeltaProjectExpansion.maybeResolveEpsilonReward(player, newPos);

    player.game.log('${0} spent ${1} energy to move their second marker backward on the Delta Project track', (b) => b.player(player).number(steps));
  }

  /**
   * Epsilon Dample's marker can move in both directions, so unlike the primary marker
   * (which can only ever reach a new position by advancing), it can land on the same
   * position more than once. Each position's reward is only granted the first time this
   * marker lands there - forward or backward - so shuttling back and forth can't be used
   * to farm a reward repeatedly.
   */
  private static maybeResolveEpsilonReward(player: IPlayer, position: number): void {
    const progress = DeltaProjectExpansion.getMarkerData(player, 'epsilon');
    const rewardedPositions = progress.rewardedPositions ?? (progress.rewardedPositions = []);
    if (rewardedPositions.includes(position)) {
      return;
    }
    rewardedPositions.push(position);
    DeltaProjectExpansion.resolveReward(player, position, 'epsilon');
  }

  private static resolveReward(player: IPlayer, position: number, marker: MarkerKind): void {
    // Positions 10/11 (VP spots) have no additional reward beyond VP claiming.
    switch (DELTA_TRACK_TAGS[position]) {
    case Tag.BUILDING: // Choose 2 steel or 2 plants
      player.defer(() => new OrOptions(
        new SelectOption('Gain 2 steel', 'Gain steel').andThen(() => {
          player.stock.add(Resource.STEEL, 2, {log: true, from: {card: CardName.DELTA_PROJECT}});
          return undefined;
        }),
        new SelectOption('Gain 2 plants', 'Gain plants').andThen(() => {
          player.stock.add(Resource.PLANTS, 2, {log: true, from: {card: CardName.DELTA_PROJECT}});
          return undefined;
        }),
      ));
      break;

    case Tag.POWER: // Choose +1 energy production or +1 heat production
      player.defer(() => new OrOptions(
        new SelectOption('Increase energy production 1 step', 'Increase').andThen(() => {
          player.production.add(Resource.ENERGY, 1, {log: true, from: {card: CardName.DELTA_PROJECT}});
          return undefined;
        }),
        new SelectOption('Increase heat production 1 step', 'Increase').andThen(() => {
          player.production.add(Resource.HEAT, 1, {log: true, from: {card: CardName.DELTA_PROJECT}});
          return undefined;
        }),
      ));
      break;

    case Tag.EARTH: // +2 MC production
      player.production.add(Resource.MEGACREDITS, 2, {log: true, from: {card: CardName.DELTA_PROJECT}});
      break;

    case Tag.SPACE: // +1 titanium production
      player.production.add(Resource.TITANIUM, 1, {log: true, from: {card: CardName.DELTA_PROJECT}});
      break;

    case Tag.SCIENCE: // Look at top 4 cards, take 2, discard rest
      player.game.defer(DrawCards.keepSome(player, 4, {keepMax: 2}));
      break;

    case Tag.PLANT: { // Gain 1 plant per plant tag
      const plantCount = player.tags.count(Tag.PLANT);
      player.stock.add(Resource.PLANTS, plantCount, {log: true, from: {card: CardName.DELTA_PROJECT}});
      break;
    }

    case Tag.MICROBE: { // Reuse a used blue card action
      const actionCards = DeltaProjectExpansion.getUsedActionCards(player);
      if (actionCards.length > 0) {
        player.defer(() => new SelectCard<IActionCard & ICard>(
          'Use a blue card action that has already been used this generation',
          'Take action',
          actionCards,
        ).andThen(([card]) => {
          player.game.log('${0} reused ${1} action via ${2}', (b) => b.player(player).card(card).cardName(CardName.DELTA_PROJECT));
          return card.action(player);
        }));
      }
      break;
    }

    case Tag.JOVIAN: { // Gain one Jovian tag
      const progress = DeltaProjectExpansion.getMarkerData(player, marker);
      if (!progress.jovianBonus) {
        progress.jovianBonus = true;
        player.tags.extraJovianTags++;
        player.triggerOnNonCardTagAdded(Tag.JOVIAN);
        for (const p of player.game.playersInGenerationOrder) {
          for (const card of p.tableau) {
            card.onNonCardTagAddedByAnyPlayer?.(p, Tag.JOVIAN);
          }
        }
        player.game.log('${0} gained a Jovian tag from the Delta Project', (b) => b.player(player));
      }
      break;
    }

    case Tag.ANIMAL: // Add 2 animals to any card
      player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 2}));
      break;
    }
  }

  private static getUsedActionCards(player: IPlayer): Array<IActionCard & ICard> {
    const result: Array<IActionCard & ICard> = [];
    for (const playedCard of player.tableau) {
      if (!isIActionCard(playedCard)) {
        continue;
      }
      if (isIHasCheckLoops(playedCard) && playedCard.getCheckLoops() >= 2) {
        continue;
      }
      if (player.actionsThisGeneration.has(playedCard.name) && playedCard.canAct(player)) {
        result.push(playedCard);
      }
    }
    return result;
  }

  private static vpForMarker(progress: DeltaProjectPlayerModel | undefined): number {
    if (progress === undefined) {
      return 0;
    }
    if (progress.position === VP5_POSITION) {
      return 5;
    }
    if (progress.position === VP2_POSITION) {
      return 2;
    }
    return 0;
  }

  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder): void {
    // A player's two markers don't stack their VP spot bonuses - take whichever is higher.
    const points = Math.max(
      DeltaProjectExpansion.vpForMarker(player.deltaProjectData),
      DeltaProjectExpansion.vpForMarker(player.epsilonDampleData),
    );

    if (points > 0) {
      builder.setVictoryPoints('victoryPoints', points, `Delta Project (${points}VP)`);
    }
  }
}
