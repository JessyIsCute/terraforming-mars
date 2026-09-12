import {CardName} from '../../../common/cards/CardName';
import {IProjectCard} from '../IProjectCard';
import {ModuleManifest} from '../ModuleManifest';
import {ClassifiedResearch, ClassifiedResearchII, ClassifiedResearchIII, ClassifiedResearchIV} from './ClassifiedResearch';
import {UraniumSmuggle, UraniumSmuggleII, UraniumSmuggleIII, UraniumSmuggleIV} from './UraniumSmuggle';
import {SmuggledReactorCore, SmuggledReactorCoreII, SmuggledReactorCoreIII, SmuggledReactorCoreIV} from './SmuggledReactorCore';
import {PoachedSpecimens, PoachedSpecimensII, PoachedSpecimensIII, PoachedSpecimensIV} from './PoachedSpecimens';
import {CounterfeitCertificates, CounterfeitCertificatesII, CounterfeitCertificatesIII, CounterfeitCertificatesIV} from './CounterfeitCertificates';
import {BlackIceHacker, BlackIceHackerII, BlackIceHackerIII, BlackIceHackerIV} from './BlackIceHacker';
import {PirateTradeRoute, PirateTradeRouteII, PirateTradeRouteIII, PirateTradeRouteIV} from './PirateTradeRoute';
import {UndergroundCasino, UndergroundCasinoII, UndergroundCasinoIII, UndergroundCasinoIV} from './UndergroundCasino';
import {BootlegTerraformingFormula, BootlegTerraformingFormulaII, BootlegTerraformingFormulaIII, BootlegTerraformingFormulaIV} from './BootlegTerraformingFormula';
import {StolenBlueprints, StolenBlueprintsII, StolenBlueprintsIII, StolenBlueprintsIV} from './StolenBlueprints';
import {IllicitMiningOp, IllicitMiningOpII, IllicitMiningOpIII, IllicitMiningOpIV} from './IllicitMiningOp';
import {RogueAiContract, RogueAiContractII, RogueAiContractIII} from './RogueAiContract';
import {OreForOxygenRacket, OreForOxygenRacketII, OreForOxygenRacketIII} from './OreForOxygenRacket';
import {MeltdownContract, MeltdownContractII, MeltdownContractIII} from './MeltdownContract';
import {CompostSyndicate, CompostSyndicateII, CompostSyndicateIII} from './CompostSyndicate';
import {GeothermalKickback, GeothermalKickbackII, GeothermalKickbackIII} from './GeothermalKickback';
import {SmuggledSeedVault, SmuggledSeedVaultII, SmuggledSeedVaultIII} from './SmuggledSeedVault';
import {HeavyMetalHustle, HeavyMetalHustleII, HeavyMetalHustleIII} from './HeavyMetalHustle';
import {ThermalSkimOperation, ThermalSkimOperationII, ThermalSkimOperationIII} from './ThermalSkimOperation';
import {CorruptOffice, CorruptOfficeII, CorruptOfficeIII} from './CorruptOffice';
import {ShellCompany, ShellCompanyII, ShellCompanyIII} from './ShellCompany';
import {BootlegBattery, BootlegBatteryII, BootlegBatteryIII} from './BootlegBattery';
import {CartelRefinery, CartelRefineryII} from './CartelRefinery';
import {BlacksiteExcavation, BlacksiteExcavationII} from './BlacksiteExcavation';
import {GreenhouseLaundering, GreenhouseLaunderingII} from './GreenhouseLaundering';
import {VentTapSyndicate, VentTapSyndicateII} from './VentTapSyndicate';
import {BlackMarketTerraformer, BlackMarketTerraformerII} from './BlackMarketTerraformer';
import {RogueTerraformingCartel, RogueTerraformingCartelII} from './RogueTerraformingCartel';
import {InsiderExitStrategy, InsiderExitStrategyII, InsiderExitStrategyIII} from './InsiderExitStrategy';
import {OuterSystemRacketeering, OuterSystemRacketeeringII, OuterSystemRacketeeringIII} from './OuterSystemRacketeering';
import {BiopiracyRing, BiopiracyRingII, BiopiracyRingIII} from './BiopiracyRing';
import {OrbitalSmugglingRing, OrbitalSmugglingRingII} from './OrbitalSmugglingRing';
import {PiratedBlueprints, PiratedBlueprintsII} from './PiratedBlueprints';
import {IllicitFusionPlant, IllicitFusionPlantII} from './IllicitFusionPlant';

/**
 * Every Black Market design's 3 printings, registered `instantiate: false` so they're never
 * shuffled into the normal shared project deck (`GameCards.instantiate()`) but remain
 * constructible by name -- `BlackMarket.ts`'s own dealing logic pulls cards directly by name,
 * and `createCard.ts`'s manifest scan covers reconstructing a market slot after a game reload.
 */
export const BLACKMARKET_CARD_MANIFEST = new ModuleManifest({
  module: 'blackMarket',
  projectCards: {
    [CardName.CLASSIFIED_RESEARCH]: {Factory: ClassifiedResearch, instantiate: false},
    [CardName.CLASSIFIED_RESEARCH_II]: {Factory: ClassifiedResearchII, instantiate: false},
    [CardName.CLASSIFIED_RESEARCH_III]: {Factory: ClassifiedResearchIII, instantiate: false},
    [CardName.CLASSIFIED_RESEARCH_IV]: {Factory: ClassifiedResearchIV, instantiate: false},

    [CardName.URANIUM_SMUGGLE]: {Factory: UraniumSmuggle, instantiate: false},
    [CardName.URANIUM_SMUGGLE_II]: {Factory: UraniumSmuggleII, instantiate: false},
    [CardName.URANIUM_SMUGGLE_III]: {Factory: UraniumSmuggleIII, instantiate: false},
    [CardName.URANIUM_SMUGGLE_IV]: {Factory: UraniumSmuggleIV, instantiate: false},

    [CardName.SMUGGLED_REACTOR_CORE]: {Factory: SmuggledReactorCore, instantiate: false},
    [CardName.SMUGGLED_REACTOR_CORE_II]: {Factory: SmuggledReactorCoreII, instantiate: false},
    [CardName.SMUGGLED_REACTOR_CORE_III]: {Factory: SmuggledReactorCoreIII, instantiate: false},
    [CardName.SMUGGLED_REACTOR_CORE_IV]: {Factory: SmuggledReactorCoreIV, instantiate: false},

    [CardName.POACHED_SPECIMENS]: {Factory: PoachedSpecimens, instantiate: false},
    [CardName.POACHED_SPECIMENS_II]: {Factory: PoachedSpecimensII, instantiate: false},
    [CardName.POACHED_SPECIMENS_III]: {Factory: PoachedSpecimensIII, instantiate: false},
    [CardName.POACHED_SPECIMENS_IV]: {Factory: PoachedSpecimensIV, instantiate: false},

    [CardName.COUNTERFEIT_CERTIFICATES]: {Factory: CounterfeitCertificates, instantiate: false},
    [CardName.COUNTERFEIT_CERTIFICATES_II]: {Factory: CounterfeitCertificatesII, instantiate: false},
    [CardName.COUNTERFEIT_CERTIFICATES_III]: {Factory: CounterfeitCertificatesIII, instantiate: false},
    [CardName.COUNTERFEIT_CERTIFICATES_IV]: {Factory: CounterfeitCertificatesIV, instantiate: false},

    [CardName.BLACK_ICE_HACKER]: {Factory: BlackIceHacker, instantiate: false},
    [CardName.BLACK_ICE_HACKER_II]: {Factory: BlackIceHackerII, instantiate: false},
    [CardName.BLACK_ICE_HACKER_III]: {Factory: BlackIceHackerIII, instantiate: false},
    [CardName.BLACK_ICE_HACKER_IV]: {Factory: BlackIceHackerIV, instantiate: false},

    [CardName.PIRATE_TRADE_ROUTE]: {Factory: PirateTradeRoute, instantiate: false},
    [CardName.PIRATE_TRADE_ROUTE_II]: {Factory: PirateTradeRouteII, instantiate: false},
    [CardName.PIRATE_TRADE_ROUTE_III]: {Factory: PirateTradeRouteIII, instantiate: false},
    [CardName.PIRATE_TRADE_ROUTE_IV]: {Factory: PirateTradeRouteIV, instantiate: false},

    // Crime tag -- requires Underworld, mirroring BlacklabCartel's per-card compatibility gate.
    [CardName.UNDERGROUND_CASINO]: {Factory: UndergroundCasino, instantiate: false, compatibility: 'underworld'},
    [CardName.UNDERGROUND_CASINO_II]: {Factory: UndergroundCasinoII, instantiate: false, compatibility: 'underworld'},
    [CardName.UNDERGROUND_CASINO_III]: {Factory: UndergroundCasinoIII, instantiate: false, compatibility: 'underworld'},
    [CardName.UNDERGROUND_CASINO_IV]: {Factory: UndergroundCasinoIV, instantiate: false, compatibility: 'underworld'},

    [CardName.BOOTLEG_TERRAFORMING_FORMULA]: {Factory: BootlegTerraformingFormula, instantiate: false},
    [CardName.BOOTLEG_TERRAFORMING_FORMULA_II]: {Factory: BootlegTerraformingFormulaII, instantiate: false},
    [CardName.BOOTLEG_TERRAFORMING_FORMULA_III]: {Factory: BootlegTerraformingFormulaIII, instantiate: false},
    [CardName.BOOTLEG_TERRAFORMING_FORMULA_IV]: {Factory: BootlegTerraformingFormulaIV, instantiate: false},

    [CardName.STOLEN_BLUEPRINTS]: {Factory: StolenBlueprints, instantiate: false},
    [CardName.STOLEN_BLUEPRINTS_II]: {Factory: StolenBlueprintsII, instantiate: false},
    [CardName.STOLEN_BLUEPRINTS_III]: {Factory: StolenBlueprintsIII, instantiate: false},
    [CardName.STOLEN_BLUEPRINTS_IV]: {Factory: StolenBlueprintsIV, instantiate: false},

    [CardName.ILLICIT_MINING_OP]: {Factory: IllicitMiningOp, instantiate: false},
    [CardName.ILLICIT_MINING_OP_II]: {Factory: IllicitMiningOpII, instantiate: false},
    [CardName.ILLICIT_MINING_OP_III]: {Factory: IllicitMiningOpIII, instantiate: false},
    [CardName.ILLICIT_MINING_OP_IV]: {Factory: IllicitMiningOpIV, instantiate: false},

    // Moved to the mid tier -- see BLACK_MARKET_DESIGNS below.
    [CardName.ROGUE_AI_CONTRACT]: {Factory: RogueAiContract, instantiate: false},
    [CardName.ROGUE_AI_CONTRACT_II]: {Factory: RogueAiContractII, instantiate: false},
    [CardName.ROGUE_AI_CONTRACT_III]: {Factory: RogueAiContractIII, instantiate: false},

    [CardName.ORE_FOR_OXYGEN_RACKET]: {Factory: OreForOxygenRacket, instantiate: false},
    [CardName.ORE_FOR_OXYGEN_RACKET_II]: {Factory: OreForOxygenRacketII, instantiate: false},
    [CardName.ORE_FOR_OXYGEN_RACKET_III]: {Factory: OreForOxygenRacketIII, instantiate: false},

    [CardName.MELTDOWN_CONTRACT]: {Factory: MeltdownContract, instantiate: false},
    [CardName.MELTDOWN_CONTRACT_II]: {Factory: MeltdownContractII, instantiate: false},
    [CardName.MELTDOWN_CONTRACT_III]: {Factory: MeltdownContractIII, instantiate: false},

    [CardName.COMPOST_SYNDICATE]: {Factory: CompostSyndicate, instantiate: false},
    [CardName.COMPOST_SYNDICATE_II]: {Factory: CompostSyndicateII, instantiate: false},
    [CardName.COMPOST_SYNDICATE_III]: {Factory: CompostSyndicateIII, instantiate: false},

    [CardName.GEOTHERMAL_KICKBACK]: {Factory: GeothermalKickback, instantiate: false},
    [CardName.GEOTHERMAL_KICKBACK_II]: {Factory: GeothermalKickbackII, instantiate: false},
    [CardName.GEOTHERMAL_KICKBACK_III]: {Factory: GeothermalKickbackIII, instantiate: false},

    [CardName.SMUGGLED_SEED_VAULT]: {Factory: SmuggledSeedVault, instantiate: false},
    [CardName.SMUGGLED_SEED_VAULT_II]: {Factory: SmuggledSeedVaultII, instantiate: false},
    [CardName.SMUGGLED_SEED_VAULT_III]: {Factory: SmuggledSeedVaultIII, instantiate: false},

    [CardName.HEAVY_METAL_HUSTLE]: {Factory: HeavyMetalHustle, instantiate: false},
    [CardName.HEAVY_METAL_HUSTLE_II]: {Factory: HeavyMetalHustleII, instantiate: false},
    [CardName.HEAVY_METAL_HUSTLE_III]: {Factory: HeavyMetalHustleIII, instantiate: false},

    [CardName.THERMAL_SKIM_OPERATION]: {Factory: ThermalSkimOperation, instantiate: false},
    [CardName.THERMAL_SKIM_OPERATION_II]: {Factory: ThermalSkimOperationII, instantiate: false},
    [CardName.THERMAL_SKIM_OPERATION_III]: {Factory: ThermalSkimOperationIII, instantiate: false},

    // Crime tag -- requires Underworld, mirroring Underground Casino's per-card compatibility gate.
    [CardName.CORRUPT_OFFICE]: {Factory: CorruptOffice, instantiate: false, compatibility: 'underworld'},
    [CardName.CORRUPT_OFFICE_II]: {Factory: CorruptOfficeII, instantiate: false, compatibility: 'underworld'},
    [CardName.CORRUPT_OFFICE_III]: {Factory: CorruptOfficeIII, instantiate: false, compatibility: 'underworld'},

    [CardName.SHELL_COMPANY]: {Factory: ShellCompany, instantiate: false},
    [CardName.SHELL_COMPANY_II]: {Factory: ShellCompanyII, instantiate: false},
    [CardName.SHELL_COMPANY_III]: {Factory: ShellCompanyIII, instantiate: false},

    [CardName.BOOTLEG_BATTERY]: {Factory: BootlegBattery, instantiate: false},
    [CardName.BOOTLEG_BATTERY_II]: {Factory: BootlegBatteryII, instantiate: false},
    [CardName.BOOTLEG_BATTERY_III]: {Factory: BootlegBatteryIII, instantiate: false},

    [CardName.CARTEL_REFINERY]: {Factory: CartelRefinery, instantiate: false},
    [CardName.CARTEL_REFINERY_II]: {Factory: CartelRefineryII, instantiate: false},

    [CardName.BLACKSITE_EXCAVATION]: {Factory: BlacksiteExcavation, instantiate: false},
    [CardName.BLACKSITE_EXCAVATION_II]: {Factory: BlacksiteExcavationII, instantiate: false},

    [CardName.GREENHOUSE_LAUNDERING]: {Factory: GreenhouseLaundering, instantiate: false},
    [CardName.GREENHOUSE_LAUNDERING_II]: {Factory: GreenhouseLaunderingII, instantiate: false},

    [CardName.VENT_TAP_SYNDICATE]: {Factory: VentTapSyndicate, instantiate: false},
    [CardName.VENT_TAP_SYNDICATE_II]: {Factory: VentTapSyndicateII, instantiate: false},

    [CardName.BLACK_MARKET_TERRAFORMER]: {Factory: BlackMarketTerraformer, instantiate: false},
    [CardName.BLACK_MARKET_TERRAFORMER_II]: {Factory: BlackMarketTerraformerII, instantiate: false},

    [CardName.ROGUE_TERRAFORMING_CARTEL]: {Factory: RogueTerraformingCartel, instantiate: false},
    [CardName.ROGUE_TERRAFORMING_CARTEL_II]: {Factory: RogueTerraformingCartelII, instantiate: false},

    [CardName.PIRATED_BLUEPRINTS]: {Factory: PiratedBlueprints, instantiate: false},
    [CardName.PIRATED_BLUEPRINTS_II]: {Factory: PiratedBlueprintsII, instantiate: false},

    [CardName.ILLICIT_FUSION_PLANT]: {Factory: IllicitFusionPlant, instantiate: false},
    [CardName.ILLICIT_FUSION_PLANT_II]: {Factory: IllicitFusionPlantII, instantiate: false},

    [CardName.INSIDER_EXIT_STRATEGY]: {Factory: InsiderExitStrategy, instantiate: false},
    [CardName.INSIDER_EXIT_STRATEGY_II]: {Factory: InsiderExitStrategyII, instantiate: false},
    [CardName.INSIDER_EXIT_STRATEGY_III]: {Factory: InsiderExitStrategyIII, instantiate: false},

    [CardName.OUTER_SYSTEM_RACKETEERING]: {Factory: OuterSystemRacketeering, instantiate: false},
    [CardName.OUTER_SYSTEM_RACKETEERING_II]: {Factory: OuterSystemRacketeeringII, instantiate: false},
    [CardName.OUTER_SYSTEM_RACKETEERING_III]: {Factory: OuterSystemRacketeeringIII, instantiate: false},

    [CardName.BIOPIRACY_RING]: {Factory: BiopiracyRing, instantiate: false},
    [CardName.BIOPIRACY_RING_II]: {Factory: BiopiracyRingII, instantiate: false},
    [CardName.BIOPIRACY_RING_III]: {Factory: BiopiracyRingIII, instantiate: false},

    // Venus tag -- requires Venus, mirroring Underground Casino's per-card compatibility gate.
    [CardName.ORBITAL_SMUGGLING_RING]: {Factory: OrbitalSmugglingRing, instantiate: false, compatibility: 'venus'},
    [CardName.ORBITAL_SMUGGLING_RING_II]: {Factory: OrbitalSmugglingRingII, instantiate: false, compatibility: 'venus'},
  },
});

/** Which era row a design belongs to; `BlackMarket.ts` unlocks `mid`/`late` at the stated generation. */
export type BlackMarketTier = 'early' | 'mid' | 'late';
export const BLACK_MARKET_TIER_UNLOCK_GENERATION: Record<BlackMarketTier, number> = {
  early: 1,
  mid: 4,
  late: 7,
};

export type BlackMarketDesign = {
  tier: BlackMarketTier;
  /**
   * The CardName printings, in reveal order -- see CardName.ts's Black Market comment.
   * Stack depth varies by tier: early designs print 4 copies, mid 3, late 2.
   */
  printings: ReadonlyArray<CardName>;
  /**
   * The numeric knob that escalates cheapest-to-priciest across the printings -- usually
   * the design's M€ cost, sometimes a resource-cost count, and for a couple of designs (e.g.
   * Poached Specimens) the size of the *reward* instead, since their cost is flat across all
   * printings. Same length as `printings`.
   */
  variants: ReadonlyArray<number>;
  /** Constructs `name` with the given printing's numeric knob. */
  build: (name: CardName, param: number) => IProjectCard;
};

export const BLACK_MARKET_DESIGNS: ReadonlyArray<BlackMarketDesign> = [
  // Early game (generation 1+)
  {
    tier: 'early',
    printings: [CardName.CLASSIFIED_RESEARCH, CardName.CLASSIFIED_RESEARCH_II, CardName.CLASSIFIED_RESEARCH_III, CardName.CLASSIFIED_RESEARCH_IV],
    variants: [7, 8, 9, 10],
    build: (name, cost) => new ClassifiedResearch(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.URANIUM_SMUGGLE, CardName.URANIUM_SMUGGLE_II, CardName.URANIUM_SMUGGLE_III, CardName.URANIUM_SMUGGLE_IV],
    variants: [8, 9, 10, 11],
    build: (name, cost) => new UraniumSmuggle(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.SMUGGLED_REACTOR_CORE, CardName.SMUGGLED_REACTOR_CORE_II, CardName.SMUGGLED_REACTOR_CORE_III, CardName.SMUGGLED_REACTOR_CORE_IV],
    variants: [1, 2, 3, 4],
    build: (name, cost) => new SmuggledReactorCore(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.POACHED_SPECIMENS, CardName.POACHED_SPECIMENS_II, CardName.POACHED_SPECIMENS_III, CardName.POACHED_SPECIMENS_IV],
    variants: [7, 8, 9, 10],
    build: (name, megacredits) => new PoachedSpecimens(name, megacredits),
  },
  {
    tier: 'early',
    printings: [CardName.COUNTERFEIT_CERTIFICATES, CardName.COUNTERFEIT_CERTIFICATES_II, CardName.COUNTERFEIT_CERTIFICATES_III, CardName.COUNTERFEIT_CERTIFICATES_IV],
    variants: [1, 2, 3, 4],
    build: (name, heat) => new CounterfeitCertificates(name, heat),
  },
  {
    tier: 'early',
    printings: [CardName.BLACK_ICE_HACKER, CardName.BLACK_ICE_HACKER_II, CardName.BLACK_ICE_HACKER_III, CardName.BLACK_ICE_HACKER_IV],
    variants: [2, 3, 4, 5],
    build: (name, energy) => new BlackIceHacker(name, energy),
  },
  {
    tier: 'early',
    printings: [CardName.PIRATE_TRADE_ROUTE, CardName.PIRATE_TRADE_ROUTE_II, CardName.PIRATE_TRADE_ROUTE_III, CardName.PIRATE_TRADE_ROUTE_IV],
    variants: [1, 2, 3, 4],
    build: (name, cost) => new PirateTradeRoute(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.UNDERGROUND_CASINO, CardName.UNDERGROUND_CASINO_II, CardName.UNDERGROUND_CASINO_III, CardName.UNDERGROUND_CASINO_IV],
    variants: [10, 11, 12, 13],
    build: (name, cost) => new UndergroundCasino(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.BOOTLEG_TERRAFORMING_FORMULA, CardName.BOOTLEG_TERRAFORMING_FORMULA_II, CardName.BOOTLEG_TERRAFORMING_FORMULA_III, CardName.BOOTLEG_TERRAFORMING_FORMULA_IV],
    variants: [4, 5, 6, 7],
    build: (name, cost) => new BootlegTerraformingFormula(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.STOLEN_BLUEPRINTS, CardName.STOLEN_BLUEPRINTS_II, CardName.STOLEN_BLUEPRINTS_III, CardName.STOLEN_BLUEPRINTS_IV],
    variants: [1, 2, 3, 4],
    build: (name, cost) => new StolenBlueprints(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.ILLICIT_MINING_OP, CardName.ILLICIT_MINING_OP_II, CardName.ILLICIT_MINING_OP_III, CardName.ILLICIT_MINING_OP_IV],
    variants: [1, 2, 3, 4],
    build: (name, cost) => new IllicitMiningOp(name, cost, cost + 3),
  },

  // Mid game (generation 4+)
  {
    // Moved here from the early tier -- draw-3-cards is a stronger effect than the rest of
    // the early roster, and 8-10 M€ reads more naturally as a mid-tier price.
    tier: 'mid',
    printings: [CardName.ROGUE_AI_CONTRACT, CardName.ROGUE_AI_CONTRACT_II, CardName.ROGUE_AI_CONTRACT_III],
    variants: [8, 9, 10],
    build: (name, cost) => new RogueAiContract(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.ORE_FOR_OXYGEN_RACKET, CardName.ORE_FOR_OXYGEN_RACKET_II, CardName.ORE_FOR_OXYGEN_RACKET_III],
    variants: [1, 2, 3],
    build: (name, cost) => new OreForOxygenRacket(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.MELTDOWN_CONTRACT, CardName.MELTDOWN_CONTRACT_II, CardName.MELTDOWN_CONTRACT_III],
    variants: [0, 1, 2],
    build: (name, cost) => new MeltdownContract(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.COMPOST_SYNDICATE, CardName.COMPOST_SYNDICATE_II, CardName.COMPOST_SYNDICATE_III],
    variants: [1, 2, 3],
    build: (name, cost) => new CompostSyndicate(name, cost, cost + 4),
  },
  {
    tier: 'mid',
    printings: [CardName.GEOTHERMAL_KICKBACK, CardName.GEOTHERMAL_KICKBACK_II, CardName.GEOTHERMAL_KICKBACK_III],
    variants: [2, 3, 4],
    build: (name, heat) => new GeothermalKickback(name, heat),
  },
  {
    tier: 'mid',
    printings: [CardName.SMUGGLED_SEED_VAULT, CardName.SMUGGLED_SEED_VAULT_II, CardName.SMUGGLED_SEED_VAULT_III],
    variants: [1, 2, 3],
    build: (name, cost) => new SmuggledSeedVault(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.HEAVY_METAL_HUSTLE, CardName.HEAVY_METAL_HUSTLE_II, CardName.HEAVY_METAL_HUSTLE_III],
    variants: [3, 4, 5],
    build: (name, titanium) => new HeavyMetalHustle(name, titanium, titanium + 2),
  },
  {
    tier: 'mid',
    printings: [CardName.THERMAL_SKIM_OPERATION, CardName.THERMAL_SKIM_OPERATION_II, CardName.THERMAL_SKIM_OPERATION_III],
    variants: [5, 6, 7],
    build: (name, cost) => new ThermalSkimOperation(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.CORRUPT_OFFICE, CardName.CORRUPT_OFFICE_II, CardName.CORRUPT_OFFICE_III],
    variants: [8, 9, 10],
    build: (name, cost) => new CorruptOffice(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.SHELL_COMPANY, CardName.SHELL_COMPANY_II, CardName.SHELL_COMPANY_III],
    variants: [6, 7, 8],
    build: (name, cost) => new ShellCompany(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.BOOTLEG_BATTERY, CardName.BOOTLEG_BATTERY_II, CardName.BOOTLEG_BATTERY_III],
    variants: [1, 2, 3],
    build: (name, cost) => new BootlegBattery(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.INSIDER_EXIT_STRATEGY, CardName.INSIDER_EXIT_STRATEGY_II, CardName.INSIDER_EXIT_STRATEGY_III],
    variants: [6, 7, 8],
    build: (name, cost) => new InsiderExitStrategy(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.OUTER_SYSTEM_RACKETEERING, CardName.OUTER_SYSTEM_RACKETEERING_II, CardName.OUTER_SYSTEM_RACKETEERING_III],
    variants: [7, 8, 9],
    build: (name, cost) => new OuterSystemRacketeering(name, cost),
  },
  {
    tier: 'mid',
    printings: [CardName.BIOPIRACY_RING, CardName.BIOPIRACY_RING_II, CardName.BIOPIRACY_RING_III],
    variants: [5, 6, 7],
    build: (name, cost) => new BiopiracyRing(name, cost),
  },

  // Late game (generation 7+)
  {
    tier: 'late',
    printings: [CardName.CARTEL_REFINERY, CardName.CARTEL_REFINERY_II],
    variants: [1, 2],
    build: (name, cost) => new CartelRefinery(name, cost, cost + 2),
  },
  {
    tier: 'late',
    printings: [CardName.BLACKSITE_EXCAVATION, CardName.BLACKSITE_EXCAVATION_II],
    variants: [1, 2],
    build: (name, cost) => new BlacksiteExcavation(name, cost),
  },
  {
    tier: 'late',
    printings: [CardName.GREENHOUSE_LAUNDERING, CardName.GREENHOUSE_LAUNDERING_II],
    variants: [6, 7],
    build: (name, plants) => new GreenhouseLaundering(name, plants, plants + 2),
  },
  {
    tier: 'late',
    printings: [CardName.VENT_TAP_SYNDICATE, CardName.VENT_TAP_SYNDICATE_II],
    variants: [4, 5],
    build: (name, heat) => new VentTapSyndicate(name, heat),
  },
  {
    tier: 'late',
    printings: [CardName.BLACK_MARKET_TERRAFORMER, CardName.BLACK_MARKET_TERRAFORMER_II],
    variants: [5, 6],
    build: (name, plants) => new BlackMarketTerraformer(name, plants),
  },
  {
    tier: 'late',
    printings: [CardName.ROGUE_TERRAFORMING_CARTEL, CardName.ROGUE_TERRAFORMING_CARTEL_II],
    variants: [4, 5],
    build: (name, titanium) => new RogueTerraformingCartel(name, titanium),
  },
  {
    tier: 'late',
    printings: [CardName.ORBITAL_SMUGGLING_RING, CardName.ORBITAL_SMUGGLING_RING_II],
    variants: [9, 10],
    build: (name, cost) => new OrbitalSmugglingRing(name, cost),
  },
  {
    tier: 'late',
    printings: [CardName.PIRATED_BLUEPRINTS, CardName.PIRATED_BLUEPRINTS_II],
    variants: [9, 10],
    build: (name, cost) => new PiratedBlueprints(name, cost),
  },
  {
    tier: 'late',
    printings: [CardName.ILLICIT_FUSION_PLANT, CardName.ILLICIT_FUSION_PLANT_II],
    variants: [5, 6],
    build: (name, heat) => new IllicitFusionPlant(name, heat),
  },
];
