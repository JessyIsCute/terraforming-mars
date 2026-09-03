import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {MicroCredits} from './MicroCredits';
import {OrbitalSeedDispersal} from './OrbitalSeedDispersal';
import {ThermalForests} from './ThermalForests';
import {VolcanicMinerals} from './VolcanicMinerals';
import {MacroMills} from './MacroMills';
import {FungalFrenzy} from './FungalFrenzy';
import {VenusianSubsidiary} from './VenusianSubsidiary';
import {VenusianBees} from './VenusianBees';
import {SomeAssemblyRequired} from './SomeAssemblyRequired';
import {PercussiveReactor} from './PercussiveReactor';
import {PeerReview} from './PeerReview';
import {FailedExperiment} from './FailedExperiment';
import {DisruptiveStartup} from './DisruptiveStartup';
import {UnpaidElectricityBill} from './UnpaidElectricityBill';
import {GasGiantTourismBoard} from './GasGiantTourismBoard';
import {CallistoTimeshare} from './CallistoTimeshare';
import {Pothole} from './Pothole';
import {LoremIpsum} from './LoremIpsum';
import {CommitteeToFormACommittee} from './CommitteeToFormACommittee';
import {RoundingError} from './RoundingError';
import {LongDistanceRelations} from './LongDistanceRelations';
import {MicroEnergies} from './MicroEnergies';
import {MicroSteels} from './MicroSteels';
import {MicroPlants} from './MicroPlants';
import {MicroTitaniums} from './MicroTitaniums';
import {WellnessDeluxe} from './WellnessDeluxe';

export const SILLYFICATION_CARD_MANIFEST = new ModuleManifest({
  module: 'sillyfication',
  corporationCards: {
    [CardName.WELLNESS_DELUXE]: {Factory: WellnessDeluxe},
  },
  projectCards: {
    [CardName.MICRO_CREDITS]: {Factory: MicroCredits},
    [CardName.ORBITAL_SEED_DISPERSAL]: {Factory: OrbitalSeedDispersal},
    [CardName.THERMAL_FORESTS]: {Factory: ThermalForests},
    [CardName.VOLCANIC_MINERALS]: {Factory: VolcanicMinerals},
    [CardName.MACRO_MILLS]: {Factory: MacroMills},
    [CardName.FUNGAL_FRENZY]: {Factory: FungalFrenzy},
    [CardName.VENUSIAN_SUBSIDIARY]: {Factory: VenusianSubsidiary, compatibility: 'venus'},
    [CardName.VENUSIAN_BEES]: {Factory: VenusianBees, compatibility: 'venus'},
    [CardName.SOME_ASSEMBLY_REQUIRED]: {Factory: SomeAssemblyRequired},
    [CardName.PERCUSSIVE_REACTOR]: {Factory: PercussiveReactor},
    [CardName.PEER_REVIEW]: {Factory: PeerReview},
    [CardName.FAILED_EXPERIMENT]: {Factory: FailedExperiment},
    [CardName.DISRUPTIVE_STARTUP]: {Factory: DisruptiveStartup},
    [CardName.UNPAID_ELECTRICITY_BILL]: {Factory: UnpaidElectricityBill},
    [CardName.GAS_GIANT_TOURISM_BOARD]: {Factory: GasGiantTourismBoard},
    [CardName.CALLISTO_TIMESHARE]: {Factory: CallistoTimeshare},
    [CardName.POTHOLE]: {Factory: Pothole},
    [CardName.LOREM_IPSUM]: {Factory: LoremIpsum},
    [CardName.COMMITTEE_TO_FORM_A_COMMITTEE]: {Factory: CommitteeToFormACommittee},
    [CardName.ROUNDING_ERROR]: {Factory: RoundingError},
    [CardName.LONG_DISTANCE_RELATIONS]: {Factory: LongDistanceRelations},
    [CardName.MICRO_ENERGIES]: {Factory: MicroEnergies},
    [CardName.MICRO_STEELS]: {Factory: MicroSteels},
    [CardName.MICRO_PLANTS]: {Factory: MicroPlants},
    [CardName.MICRO_TITANIUMS]: {Factory: MicroTitaniums},
  },
});
