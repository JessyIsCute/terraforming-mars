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
import {NeptuneResearchVessel} from './NeptuneResearchVessel';
import {Pothole} from './Pothole';
import {LoremIpsum} from './LoremIpsum';
import {CommitteeToFormACommittee} from './CommitteeToFormACommittee';
import {RoundingError} from './RoundingError';
import {LongDistanceRelations} from './LongDistanceRelations';
import {MicroEnergies} from './MicroEnergies';
import {MicroSteels} from './MicroSteels';
import {MicroPlants} from './MicroPlants';
import {MicroTitaniums} from './MicroTitaniums';
import {ScaffoldingForever} from './ScaffoldingForever';
import {CoreMines} from './CoreMines';
import {MineralFabricators} from './MineralFabricators';
import {ThermalSmeltery} from './ThermalSmeltery';
import {DebrisField} from './DebrisField';
import {OrbitDumping} from './OrbitDumping';
import {GarbageDumps} from './GarbageDumps';
import {LaunchWindow} from './LaunchWindow';
import {GlobalEnergyInfrastructure} from './GlobalEnergyInfrastructure';
import {CropTheft} from './CropTheft';
import {Swaperoo} from './Swaperoo';
import {Switcharoo} from './Switcharoo';
import {WellnessDeluxe} from './WellnessDeluxe';
import {VenusVentures} from './VenusVentures';

export const SILLYFICATION_CARD_MANIFEST = new ModuleManifest({
  module: 'sillyfication',
  corporationCards: {
    [CardName.WELLNESS_DELUXE]: {Factory: WellnessDeluxe},
    [CardName.VENUS_VENTURES]: {Factory: VenusVentures, compatibility: 'venus'},
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
    [CardName.NEPTUNE_RESEARCH_VESSEL]: {Factory: NeptuneResearchVessel},
    [CardName.POTHOLE]: {Factory: Pothole},
    [CardName.LOREM_IPSUM]: {Factory: LoremIpsum},
    [CardName.COMMITTEE_TO_FORM_A_COMMITTEE]: {Factory: CommitteeToFormACommittee},
    [CardName.ROUNDING_ERROR]: {Factory: RoundingError},
    [CardName.LONG_DISTANCE_RELATIONS]: {Factory: LongDistanceRelations},
    [CardName.MICRO_ENERGIES]: {Factory: MicroEnergies},
    [CardName.MICRO_STEELS]: {Factory: MicroSteels},
    [CardName.MICRO_PLANTS]: {Factory: MicroPlants},
    [CardName.MICRO_TITANIUMS]: {Factory: MicroTitaniums},
    [CardName.SCAFFOLDING_FOREVER]: {Factory: ScaffoldingForever},
    [CardName.CORE_MINES]: {Factory: CoreMines},
    [CardName.MINERAL_FABRICATORS]: {Factory: MineralFabricators},
    [CardName.THERMAL_SMELTERY]: {Factory: ThermalSmeltery},
    [CardName.DEBRIS_FIELD]: {Factory: DebrisField},
    [CardName.ORBIT_DUMPING]: {Factory: OrbitDumping},
    [CardName.GARBAGE_DUMPS]: {Factory: GarbageDumps},
    [CardName.LAUNCH_WINDOW]: {Factory: LaunchWindow},
    [CardName.GLOBAL_ENERGY_INFRASTRUCTURE]: {Factory: GlobalEnergyInfrastructure},
    [CardName.CROP_THEFT]: {Factory: CropTheft},
    [CardName.SWAPEROO]: {Factory: Swaperoo},
    [CardName.SWITCHAROO]: {Factory: Switcharoo},
  },
});
