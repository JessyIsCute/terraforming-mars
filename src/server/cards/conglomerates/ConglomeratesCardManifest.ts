import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {Selfish} from './Selfish';
import {FullAccessCooperation} from './FullAccessCooperation';
import {HelpRequest} from './HelpRequest';

export const CONGLOMERATES_CARD_MANIFEST = new ModuleManifest({
  module: 'conglomerates',
  projectCards: {
    [CardName.SELFISH]: {Factory: Selfish},
    [CardName.FULL_ACCESS_COOPERATION]: {Factory: FullAccessCooperation},
    [CardName.HELP_REQUEST]: {Factory: HelpRequest},
  },
});
