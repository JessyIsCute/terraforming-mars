import {BonusId, PolicyId} from '@/common/turmoil/Types';
import {PartyName} from '@/common/turmoil/PartyName';
import {IClientAgenda} from '@/common/turmoil/IClientAgenda';
// @ts-ignore agendas.json doesn't exist during npm run build
import agendaJson from '@/genfiles/agendas.json';
// @ts-ignore agendas-more-parties.json doesn't exist during npm run build
import moreAgendaJson from '@/genfiles/agendas-more-parties.json';

const agendas = agendaJson as Partial<Record<BonusId | PolicyId, IClientAgenda>>;
const moreAgendas = moreAgendaJson as Partial<Record<BonusId | PolicyId, IClientAgenda>>;

export function getAgenda(id: BonusId | PolicyId, morePartiesExpansion: boolean = false): IClientAgenda | undefined {
  const source = morePartiesExpansion ? moreAgendas : agendas;
  return source[id];
}

export function getAgendaOrThrow(id: BonusId | PolicyId, morePartiesExpansion: boolean = false): IClientAgenda {
  const agenda = getAgenda(id, morePartiesExpansion);
  if (agenda === undefined) {
    throw new Error(`agenda ${id} not found`);
  }
  return agenda;
}

// Always the standard (non-moreParties) ids for a party -- used by the Political Parties help
// page, which shows every party's normal content regardless of which game options are active.
export function getPartyAgendaIds(partyName: PartyName): {bonuses: Array<BonusId>; policies: Array<PolicyId>} {
  const bonuses: Array<BonusId> = [];
  const policies: Array<PolicyId> = [];
  for (const id of Object.keys(agendas) as Array<BonusId | PolicyId>) {
    if (agendas[id]?.partyName !== partyName) {
      continue;
    }
    if (id[1] === 'b') {
      bonuses.push(id as BonusId);
    } else {
      policies.push(id as PolicyId);
    }
  }
  return {bonuses, policies};
}
