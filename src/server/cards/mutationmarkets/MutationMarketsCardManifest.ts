import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {Pandemica} from './Pandemica';

export const MUTATIONMARKETS_CARD_MANIFEST = new ModuleManifest({
  module: 'mutationMarkets',
  corporationCards: {
    [CardName.PANDEMICA]: {Factory: Pandemica, compatibility: 'underworld'},
  },
});
