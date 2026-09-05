import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {DeltaProject} from './DeltaProject';
import {EpsilonDample} from './EpsilonDample';

export const DELTA_PROJECT_CARD_MANIFEST = new ModuleManifest({
  module: 'deltaProject',
  corporationCards: {
    [CardName.EPSILON_DAMPLE]: {Factory: EpsilonDample},
  },
  preludeCards: {
    [CardName.DELTA_PROJECT]: {Factory: DeltaProject},
  },
});
