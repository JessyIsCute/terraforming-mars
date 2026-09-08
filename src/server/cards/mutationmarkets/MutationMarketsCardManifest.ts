import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {BlacklabCartel} from './BlacklabCartel';

export const MUTATIONMARKETS_CARD_MANIFEST = new ModuleManifest({
  module: 'mutationMarkets',
  corporationCards: {
    [CardName.BLACKLAB_CARTEL]: {Factory: BlacklabCartel, compatibility: 'underworld'},
  },
});
