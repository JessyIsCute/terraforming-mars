import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {MicroCredits} from './MicroCredits';
import {OrbitalSeedDispersal} from './OrbitalSeedDispersal';
import {ThermalForests} from './ThermalForests';
import {VolcanicMinerals} from './VolcanicMinerals';
import {MacroMills} from './MacroMills';
import {FungalFrenzy} from './FungalFrenzy';
import {VenusianSubsidiary} from './VenusianSubsidiary';

export const SILLYFICATION_CARD_MANIFEST = new ModuleManifest({
  module: 'sillyfication',
  projectCards: {
    [CardName.MICRO_CREDITS]: {Factory: MicroCredits},
    [CardName.ORBITAL_SEED_DISPERSAL]: {Factory: OrbitalSeedDispersal},
    [CardName.THERMAL_FORESTS]: {Factory: ThermalForests},
    [CardName.VOLCANIC_MINERALS]: {Factory: VolcanicMinerals},
    [CardName.MACRO_MILLS]: {Factory: MacroMills},
    [CardName.FUNGAL_FRENZY]: {Factory: FungalFrenzy},
    [CardName.VENUSIAN_SUBSIDIARY]: {Factory: VenusianSubsidiary},
  },
});
