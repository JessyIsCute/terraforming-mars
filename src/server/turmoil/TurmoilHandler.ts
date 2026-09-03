import * as constants from '../../common/constants';
import {ICard} from '../cards/ICard';
import {GlobalParameter} from '../../common/GlobalParameter';
import {SelectOption} from '../inputs/SelectOption';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {Resource} from '../../common/Resource';
import {SpaceType} from '../../common/boards/SpaceType';
import {GREENS_POLICY_2, GREENS_POLICY_3} from './parties/Greens';
import {KELVINISTS_POLICY_3, KELVINISTS_POLICY_4} from './parties/Kelvinists';
import {MARS_FIRST_POLICY_2} from './parties/MarsFirst';
import {PartyHooks} from './parties/PartyHooks';
import {PartyName} from '../../common/turmoil/PartyName';
import {REDS_POLICY_2} from './parties/Reds';
import {MoonExpansion} from '../moon/MoonExpansion';
import {TRSource} from '../../common/cards/TRSource';
import {IPolicy, policyDescription} from './Policy';
import {ParameterBonus, ParameterTrack} from '../../common/GlobalParameterConfig';

/** The value at which a track first grants a bonus of the given kind, or Infinity if never. */
function bonusThreshold(track: ParameterTrack, kind: ParameterBonus['kind']): number {
  const bonus = track.bonuses.find((b) => b.kind === kind);
  return bonus === undefined ? Infinity : bonus.value;
}

export class TurmoilHandler {
  private constructor() {}

  public static partyAction(player: IPlayer): PlayerInput | undefined {
    const turmoil = player.game.turmoil;
    if (turmoil === undefined) {
      return undefined;
    }
    const policy: IPolicy = turmoil.rulingPolicy();
    // kp03 is rendered in the Convert Heat slot by Player.getActions(); skip
    // here to avoid double-rendering.
    if (policy.id === KELVINISTS_POLICY_3.id) {
      return undefined;
    }
    if (policy.canAct?.(player)) {
      return new SelectOption(policyDescription(policy, player), 'Pay').andThen(() => policy.action?.(player));
    }
    return undefined;
  }

  public static applyOnCardPlayedEffect(player: IPlayer, selectedCard: ICard): void {
    // PoliticalAgendas Greens P3 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.GREENS, 'gp03')) {
      GREENS_POLICY_3.onCardPlayed(player, selectedCard);
    }

    // PoliticalAgendas MarsFirst P2 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.MARS, 'mp02')) {
      MARS_FIRST_POLICY_2.onCardPlayed(player, selectedCard);
    }
  }

  public static resolveTilePlacementCosts(player: IPlayer): void {
    // PoliticalAgendas Reds P2 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.REDS, 'rp02')) {
      REDS_POLICY_2.onTilePlaced(player);
    }
  }

  public static resolveTilePlacementBonuses(player: IPlayer, spaceType: SpaceType): void {
    PartyHooks.applyMarsFirstRulingPolicy(player, spaceType);

    // PoliticalAgendas Greens P2 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.GREENS, 'gp02')) {
      GREENS_POLICY_2.onTilePlaced(player);
    }

    // PoliticalAgendas Kelvinists P4 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.KELVINISTS, 'kp04')) {
      KELVINISTS_POLICY_4.onTilePlaced(player);
    }
  }

  public static onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number = 1): void {
    if (parameter === GlobalParameter.TEMPERATURE) {
      // PoliticalAgendas Kelvinists P2 hook
      if (PartyHooks.shouldApplyPolicy(player, PartyName.KELVINISTS, 'kp02')) {
        player.stock.add(Resource.MEGACREDITS, steps * 3);
      }
    }

    // PoliticalAgendas Reds P4 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.REDS, 'rp04')) {
      player.production.add(Resource.MEGACREDITS, -1 * steps, {log: true});
    }

    // PoliticalAgendas Scientists P3 hook
    if (PartyHooks.shouldApplyPolicy(player, PartyName.SCIENTISTS, 'sp03')) {
      player.drawCard(steps);
    }
  }

  public static computeTerraformRatingBump(player: IPlayer, tr: TRSource = {}): number {
    if (!PartyHooks.reds01PolicyInEffect(player)) {
      return 0;
    }

    // Making a local copy since it's going to get mutated.
    tr = {...tr};

    let total = 0;

    const parameters = player.game.parameters;

    if (tr.oxygen !== undefined) {
      const availableSteps = parameters.oxygen.max - player.game.getOxygenLevel();
      const steps = Math.min(availableSteps, tr.oxygen);
      total = total + steps;
      const chainToTemperature = bonusThreshold(parameters.oxygen, 'temperature');
      if (player.game.getOxygenLevel() < chainToTemperature &&
          player.game.getOxygenLevel() + steps >= chainToTemperature) {
        tr.temperature = (tr.temperature ?? 0) + 1;
      }
    }

    if (tr.temperature !== undefined) {
      const availableSteps = Math.floor((parameters.temperature.max - player.game.getTemperature()) / 2);
      const steps = Math.min(availableSteps, tr.temperature);
      total = total + steps;
      const chainToOcean = bonusThreshold(parameters.temperature, 'ocean');
      if (player.game.getTemperature() < chainToOcean &&
        player.game.getTemperature() + (steps * 2) >= chainToOcean) {
        tr.oceans = (tr.oceans ?? 0) + 1;
      }
    }

    if (tr.oceans !== undefined) {
      const availableSteps = parameters.oceans.max - player.game.board.getOceanSpaces().length;
      const steps = Math.min(availableSteps, tr.oceans);
      total = total + steps;
    }

    if (tr.venus !== undefined) {
      const availableSteps = Math.floor((parameters.venus.max - player.game.getVenusScaleLevel()) / 2);
      const steps = Math.min(availableSteps, tr.venus);
      total = total + steps;
      const chainToTr = bonusThreshold(parameters.venus, 'tr');
      if (player.game.getVenusScaleLevel() < chainToTr &&
        player.game.getVenusScaleLevel() + (steps * 2) >= chainToTr) {
        tr.tr = (tr.tr ?? 0) + 1;
      }
    }

    MoonExpansion.ifMoon(player.game, (moonData) => {
      if (tr.moonHabitat !== undefined) {
        const availableSteps = constants.MAXIMUM_HABITAT_RATE - moonData.habitatRate;
        total = total + Math.min(availableSteps, tr.moonHabitat);
      }

      if (tr.moonMining !== undefined) {
        const availableSteps = constants.MAXIMUM_MINING_RATE - moonData.miningRate;
        total = total + Math.min(availableSteps, tr.moonMining);
      }

      if (tr.moonLogistic !== undefined) {
        const availableSteps = constants.MAXIMUM_LOGISTIC_RATE - moonData.logisticRate;
        total = total + Math.min(availableSteps, tr.moonLogistic);
      }
    });

    total += tr.tr ?? 0;

    if (player.preservationProgram === true) {
      total = Math.max(total - 1, 0);
    }

    return total;
  }
}
