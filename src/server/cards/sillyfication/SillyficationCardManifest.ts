import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {MicroCredits} from './MicroCredits';

export const SILLYFICATION_CARD_MANIFEST = new ModuleManifest({
  module: 'sillyfication',
  projectCards: {
    [CardName.MICRO_CREDITS]: {Factory: MicroCredits},
  },
});
