import {BonusId, PolicyId} from '@/common/turmoil/Types';
import {PartyName} from '@/common/turmoil/PartyName';
import {IClientAgenda} from '@/common/turmoil/IClientAgenda';
// @ts-ignore agendas.json doesn't exist during npm run build
import agendaJson from '@/genfiles/agendas.json';
// @ts-ignore agendas-more-parties.json doesn't exist during npm run build
import moreAgendaJson from '@/genfiles/agendas-more-parties.json';

const agendas: Map<BonusId | PolicyId, IClientAgenda> = new Map();
(agendaJson as any as Array<IClientAgenda>).forEach((agenda) => agendas.set(agenda.id, agenda));

const moreAgendas: Map<BonusId | PolicyId, IClientAgenda> = new Map();
(moreAgendaJson as any as Array<IClientAgenda>).forEach((agenda) => moreAgendas.set(agenda.id, agenda));

export function getAgendaDescription(id: BonusId | PolicyId, morePartiesExpansion: boolean = false): string {
  const source = morePartiesExpansion ? moreAgendas : agendas;
  return source.get(id)?.description ?? `Unknown agenda ${id}`;
}

// Always the standard (non-moreParties) ids for a party -- used by the Political Parties help
// page, which shows every party's normal content regardless of which game options are active.
export function getPartyAgendaIds(partyName: PartyName): {bonuses: Array<BonusId>; policies: Array<PolicyId>} {
  const bonuses: Array<BonusId> = [];
  const policies: Array<PolicyId> = [];
  agendas.forEach((agenda) => {
    if (agenda.partyName !== partyName) {
      return;
    }
    if (agenda.id[1] === 'b') {
      bonuses.push(agenda.id as BonusId);
    } else {
      policies.push(agenda.id as PolicyId);
    }
  });
  return {bonuses, policies};
}
