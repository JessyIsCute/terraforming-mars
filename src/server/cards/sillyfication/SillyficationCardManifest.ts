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
import {MicroEnergy} from './MicroEnergy';
import {MicroSteel} from './MicroSteel';
import {MicroPlant} from './MicroPlant';
import {MicroTitanium} from './MicroTitanium';
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
import {Horses} from './Horses';
import {AriAdore} from './AriAdore';
import {ChipFabricationPlant} from './ChipFabricationPlant';
import {UranusSeaCreatures} from './UranusSeaCreatures';
import {LivestockLobby} from './LivestockLobby';
import {Robinitta} from './Robinitta';
import {ChillingRiches} from './ChillingRiches';
import {ColdLikeSteel} from './ColdLikeSteel';
import {SteelPhobo} from './SteelPhobo';
import {PharmacyOnLuna} from './PharmacyOnLuna';
import {VitorVitalis} from './VitorVitalis';
import {CorruptGovernors} from './CorruptGovernors';
import {OvercrowdedColony} from './OvercrowdedColony';
import {NecroticBloom} from './NecroticBloom';
import {GuerrillaGardening} from './GuerrillaGardening';
import {SlashAndBurn} from './SlashAndBurn';
import {Nepotism} from './Nepotism';
import {RotatingHands} from './RotatingHands';
import {ShowAndTell} from './ShowAndTell';
import {MusicalChairs} from './MusicalChairs';
import {WellnessDeluxe} from './WellnessDeluxe';
import {VenusVentures} from './VenusVentures';
import {Critterworld} from './Critterworld';
import {LunarBeamSilly} from './replacements/LunarBeamSilly';
import {LunaMetropolisSilly} from './replacements/LunaMetropolisSilly';
import {LunarExportsSilly} from './replacements/LunarExportsSilly';
import {PristarSilly} from './replacements/PristarSilly';
import {EarlySettlementSilly} from './replacements/EarlySettlementSilly';
import {SelfSufficientSettlementSilly} from './replacements/SelfSufficientSettlementSilly';
import {EosChasmaNationalParkSilly} from './replacements/EosChasmaNationalParkSilly';
import {ImmigrationShuttlesSilly} from './replacements/ImmigrationShuttlesSilly';
import {MartianRailsSilly} from './replacements/MartianRailsSilly';
import {NoctisCitySilly} from './replacements/NoctisCitySilly';
import {NoctisFarmingSilly} from './replacements/NoctisFarmingSilly';
import {ProtectedValleySilly} from './replacements/ProtectedValleySilly';
import {MarsUniversitySilly} from './replacements/MarsUniversitySilly';
import {ProtectedHabitatsSilly} from './replacements/ProtectedHabitatsSilly';
import {TropicalResortSilly} from './replacements/TropicalResortSilly';
import {MartianMediaCenterSilly} from './replacements/MartianMediaCenterSilly';

export const SILLYFICATION_CARD_MANIFEST = new ModuleManifest({
  module: 'sillyfication',
  corporationCards: {
    [CardName.WELLNESS_DELUXE]: {Factory: WellnessDeluxe},
    [CardName.VENUS_VENTURES]: {Factory: VenusVentures, compatibility: 'venus'},
    [CardName.CRITTERWORLD]: {Factory: Critterworld},
    [CardName.PRISTAR_SILLY]: {Factory: PristarSilly, compatibility: 'turmoil'},
  },
  preludeCards: {
    [CardName.EARLY_SETTLEMENT_SILLY]: {Factory: EarlySettlementSilly, compatibility: 'prelude'},
    [CardName.SELF_SUFFICIENT_SETTLEMENT_SILLY]: {Factory: SelfSufficientSettlementSilly, compatibility: 'prelude'},
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
    [CardName.MICRO_ENERGY]: {Factory: MicroEnergy},
    [CardName.MICRO_STEEL]: {Factory: MicroSteel},
    [CardName.MICRO_PLANT]: {Factory: MicroPlant},
    [CardName.MICRO_TITANIUM]: {Factory: MicroTitanium},
    [CardName.SCAFFOLDING_FOREVER]: {Factory: ScaffoldingForever},
    [CardName.CORE_MINES]: {Factory: CoreMines},
    [CardName.MINERAL_FABRICATORS]: {Factory: MineralFabricators},
    [CardName.THERMAL_SMELTERY]: {Factory: ThermalSmeltery},
    [CardName.DEBRIS_FIELD]: {Factory: DebrisField},
    [CardName.ORBIT_DUMPING]: {Factory: OrbitDumping},
    [CardName.GARBAGE_DUMPS]: {Factory: GarbageDumps, compatibility: 'pathfinders'},
    [CardName.LAUNCH_WINDOW]: {Factory: LaunchWindow},
    [CardName.GLOBAL_ENERGY_INFRASTRUCTURE]: {Factory: GlobalEnergyInfrastructure},
    [CardName.CROP_THEFT]: {Factory: CropTheft},
    [CardName.SWAPEROO]: {Factory: Swaperoo},
    [CardName.SWITCHAROO]: {Factory: Switcharoo},
    [CardName.HORSES]: {Factory: Horses},
    [CardName.ARI_ADORE]: {Factory: AriAdore},
    [CardName.CHIP_FABRICATION_PLANT]: {Factory: ChipFabricationPlant},
    [CardName.URANUS_SEA_CREATURES]: {Factory: UranusSeaCreatures},
    [CardName.LIVESTOCK_LOBBY]: {Factory: LivestockLobby},
    [CardName.ROBINITTA]: {Factory: Robinitta},
    [CardName.CHILLING_RICHES]: {Factory: ChillingRiches},
    [CardName.COLD_LIKE_STEEL]: {Factory: ColdLikeSteel},
    [CardName.STEEL_PHOBO]: {Factory: SteelPhobo},
    [CardName.PHARMACY_ON_LUNA]: {Factory: PharmacyOnLuna, compatibility: 'moon'},
    [CardName.VITOR_VITALIS]: {Factory: VitorVitalis},
    [CardName.CORRUPT_GOVERNORS]: {Factory: CorruptGovernors, compatibility: 'turmoil'},
    [CardName.OVERCROWDED_COLONY]: {Factory: OvercrowdedColony, compatibility: 'colonies'},
    [CardName.NECROTIC_BLOOM]: {Factory: NecroticBloom},
    [CardName.GUERRILLA_GARDENING]: {Factory: GuerrillaGardening},
    [CardName.SLASH_AND_BURN]: {Factory: SlashAndBurn},
    [CardName.NEPOTISM]: {Factory: Nepotism, compatibility: 'turmoil'},
    [CardName.ROTATING_HANDS]: {Factory: RotatingHands},
    [CardName.SHOW_AND_TELL]: {Factory: ShowAndTell},
    [CardName.MUSICAL_CHAIRS]: {Factory: MusicalChairs},

    // Replacement cards (swap into the base pool; see cardsToRemove below)
    [CardName.LUNAR_BEAM_SILLY]: {Factory: LunarBeamSilly},
    [CardName.LUNA_METROPOLIS_SILLY]: {Factory: LunaMetropolisSilly, compatibility: 'venus'},
    [CardName.LUNAR_EXPORTS_SILLY]: {Factory: LunarExportsSilly, compatibility: 'colonies'},
    [CardName.EOS_CHASMA_NATIONAL_PARK_SILLY]: {Factory: EosChasmaNationalParkSilly},
    [CardName.IMMIGRATION_SHUTTLES_SILLY]: {Factory: ImmigrationShuttlesSilly},
    [CardName.MARTIAN_RAILS_SILLY]: {Factory: MartianRailsSilly},
    [CardName.NOCTIS_CITY_SILLY]: {Factory: NoctisCitySilly},
    [CardName.NOCTIS_FARMING_SILLY]: {Factory: NoctisFarmingSilly},
    [CardName.PROTECTED_VALLEY_SILLY]: {Factory: ProtectedValleySilly},
    [CardName.MARS_UNIVERSITY_SILLY]: {Factory: MarsUniversitySilly},
    [CardName.PROTECTED_HABITATS_SILLY]: {Factory: ProtectedHabitatsSilly},
    [CardName.TROPICAL_RESORT_SILLY]: {Factory: TropicalResortSilly},
    [CardName.MARTIAN_MEDIA_CENTER_SILLY]: {Factory: MartianMediaCenterSilly, compatibility: 'turmoil'},
  },
  cardsToRemove: [
    CardName.LUNAR_BEAM,
    CardName.LUNA_METROPOLIS,
    CardName.LUNAR_EXPORTS,
    CardName.PRISTAR,
    CardName.EARLY_SETTLEMENT,
    CardName.SELF_SUFFICIENT_SETTLEMENT,
    CardName.EOS_CHASMA_NATIONAL_PARK,
    CardName.IMMIGRATION_SHUTTLES,
    CardName.MARTIAN_RAILS,
    CardName.NOCTIS_CITY,
    CardName.NOCTIS_FARMING,
    CardName.PROTECTED_VALLEY,
    CardName.MARS_UNIVERSITY,
    CardName.PROTECTED_HABITATS,
    CardName.TROPICAL_RESORT,
    CardName.MARTIAN_MEDIA_CENTER,
  ],
});
