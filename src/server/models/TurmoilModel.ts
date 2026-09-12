import {Color} from '../../common/Color';
import {PartyName} from '../../common/turmoil/PartyName';
import {IGame} from '../IGame';
import {PoliticalAgendas} from '../turmoil/PoliticalAgendas';
import {Delegate, Turmoil} from '../turmoil/Turmoil';
import {DelegatesModel, PartyModel, PoliticalAgendasModel, TurmoilModel} from '../../common/models/TurmoilModel';
import {ConglomeratesExpansion} from '../conglomerates/ConglomeratesExpansion';

export function getTurmoilModel(game: IGame): TurmoilModel | undefined {
  return Turmoil.ifTurmoilElse(game, (turmoil) => {
    const parties = getParties(game);
    let chairman: Color | undefined;

    if (turmoil.chairman) {
      chairman = delegateColor(turmoil.chairman);
    }
    const dominant = turmoil.dominantParty.name;
    const ruling = turmoil.rulingParty.name;

    const reserve: Array<DelegatesModel> = [];
    const lobby: Array<Color> = [];
    turmoil.delegateReserve.forEachMultiplicity((count, delegate) => {
      const color = delegateColor(delegate);
      if (delegate !== 'NEUTRAL') {
        if (!turmoil.usedFreeDelegateAction.has(delegate)) {
          count--;
          lobby.push(color);
        }
      }
      reserve.push({
        color: color,
        number: count,
      });
    });

    const politicalAgendas: PoliticalAgendasModel = {
      marsFirst: PoliticalAgendas.getAgenda(turmoil, PartyName.MARS),
      scientists: PoliticalAgendas.getAgenda(turmoil, PartyName.SCIENTISTS),
      unity: PoliticalAgendas.getAgenda(turmoil, PartyName.UNITY),
      greens: PoliticalAgendas.getAgenda(turmoil, PartyName.GREENS),
      reds: PoliticalAgendas.getAgenda(turmoil, PartyName.REDS),
      kelvinists: PoliticalAgendas.getAgenda(turmoil, PartyName.KELVINISTS),
      populists: PoliticalAgendas.getAgenda(turmoil, PartyName.POPULISTS),
      spome: PoliticalAgendas.getAgenda(turmoil, PartyName.SPOME),
      empower: PoliticalAgendas.getAgenda(turmoil, PartyName.EMPOWER),
      bureaucrats: PoliticalAgendas.getAgenda(turmoil, PartyName.BUREAUCRATS),
      centrists: PoliticalAgendas.getAgenda(turmoil, PartyName.CENTRISTS),
      transhumanists: PoliticalAgendas.getAgenda(turmoil, PartyName.TRANSHUMANISTS),
    };

    const policyActionUsers = Array.from(
      game.playersInGenerationOrder,
      (player) => {
        return {
          color: player.color,
          turmoilPolicyActionUsed: player.turmoilPolicyActionUsed,
          politicalAgendasActionUsedCount: player.politicalAgendasActionUsedCount};
      },
    );

    return {
      chairman,
      ruling,
      dominant,
      parties,
      lobby,
      reserve,
      distant: turmoil.distantGlobalEvent?.name,
      coming: turmoil.comingGlobalEvent?.name,
      current: turmoil.currentGlobalEvent?.name,
      politicalAgendas,
      policyActionUsers,
    };
  },
  () => undefined);
}

function getParties(game: IGame): Array<PartyModel> {
  return Turmoil.ifTurmoilElse(game,
    (turmoil) => {
      return turmoil.parties.map(function(party) {
        const delegates: Array<DelegatesModel> = [];
        for (const player of party.delegates.keys()) {
          const number = party.delegates.count(player);
          delegates.push({
            color: delegateColor(player),
            number,
          });
        }
        const partyLeader = party.partyLeader === undefined ? undefined : delegateColor(party.partyLeader);
        return {
          name: party.name,
          partyLeader: partyLeader,
          delegates: delegates,
        };
      });
    },
    () => []);
}

function delegateColor(delegate: Delegate): Color {
  if (delegate === 'NEUTRAL') {
    return 'neutral';
  }
  return ConglomeratesExpansion.teamDisplayColor(delegate) ?? delegate.color;
}
