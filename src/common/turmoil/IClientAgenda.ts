import {BonusId, PolicyId} from './Types';
import {PartyName} from './PartyName';

export interface IClientAgenda {
  id: BonusId | PolicyId;
  partyName: PartyName;
  description: string;
}
