import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {CloudCityStandardProject} from './CloudCityStandardProject';
import {GasMineStandardProject} from './GasMineStandardProject';
import {FloaterArrayStandardProject} from './FloaterArrayStandardProject';

export const VENUS_PHASE_2_CARD_MANIFEST = new ModuleManifest({
  module: 'venusPhase2',
  standardProjects: {
    [CardName.CLOUD_CITY_STANDARD_PROJECT]: {Factory: CloudCityStandardProject},
    [CardName.GAS_MINE_STANDARD_PROJECT]: {Factory: GasMineStandardProject},
    [CardName.FLOATER_ARRAY_STANDARD_PROJECT]: {Factory: FloaterArrayStandardProject},
  },
});
