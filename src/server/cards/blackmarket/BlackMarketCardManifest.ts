import {CardName} from '../../../common/cards/CardName';
import {IProjectCard} from '../IProjectCard';
import {ModuleManifest} from '../ModuleManifest';
import {ClassifiedResearch, ClassifiedResearchII, ClassifiedResearchIII} from './ClassifiedResearch';
import {UraniumSmuggle, UraniumSmuggleII, UraniumSmuggleIII} from './UraniumSmuggle';
import {SmuggledReactorCore, SmuggledReactorCoreII, SmuggledReactorCoreIII} from './SmuggledReactorCore';
import {PoachedSpecimens, PoachedSpecimensII, PoachedSpecimensIII} from './PoachedSpecimens';
import {CounterfeitCertificates, CounterfeitCertificatesII, CounterfeitCertificatesIII} from './CounterfeitCertificates';
import {BlackIceHacker, BlackIceHackerII, BlackIceHackerIII} from './BlackIceHacker';
import {PirateTradeRoute, PirateTradeRouteII, PirateTradeRouteIII} from './PirateTradeRoute';
import {UndergroundCasino, UndergroundCasinoII, UndergroundCasinoIII} from './UndergroundCasino';
import {BootlegTerraformingFormula, BootlegTerraformingFormulaII, BootlegTerraformingFormulaIII} from './BootlegTerraformingFormula';
import {StolenBlueprints, StolenBlueprintsII, StolenBlueprintsIII} from './StolenBlueprints';
import {IllicitMiningOp, IllicitMiningOpII, IllicitMiningOpIII} from './IllicitMiningOp';
import {RogueAiContract, RogueAiContractII, RogueAiContractIII} from './RogueAiContract';
import {OreForOxygenRacket, OreForOxygenRacketII, OreForOxygenRacketIII} from './OreForOxygenRacket';
import {MeltdownContract, MeltdownContractII, MeltdownContractIII} from './MeltdownContract';
import {CompostSyndicate, CompostSyndicateII, CompostSyndicateIII} from './CompostSyndicate';
import {GeothermalKickback, GeothermalKickbackII, GeothermalKickbackIII} from './GeothermalKickback';
import {SmuggledSeedVault, SmuggledSeedVaultII, SmuggledSeedVaultIII} from './SmuggledSeedVault';
import {HeavyMetalHustle, HeavyMetalHustleII, HeavyMetalHustleIII} from './HeavyMetalHustle';
import {CartelRefinery, CartelRefineryII, CartelRefineryIII} from './CartelRefinery';
import {BlacksiteExcavation, BlacksiteExcavationII, BlacksiteExcavationIII} from './BlacksiteExcavation';
import {GreenhouseLaundering, GreenhouseLaunderingII, GreenhouseLaunderingIII} from './GreenhouseLaundering';
import {VentTapSyndicate, VentTapSyndicateII, VentTapSyndicateIII} from './VentTapSyndicate';
import {BlackMarketTerraformer, BlackMarketTerraformerII, BlackMarketTerraformerIII} from './BlackMarketTerraformer';
import {RogueTerraformingCartel, RogueTerraformingCartelII, RogueTerraformingCartelIII} from './RogueTerraformingCartel';

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

    [CardName.URANIUM_SMUGGLE]: {Factory: UraniumSmuggle, instantiate: false},
    [CardName.URANIUM_SMUGGLE_II]: {Factory: UraniumSmuggleII, instantiate: false},
    [CardName.URANIUM_SMUGGLE_III]: {Factory: UraniumSmuggleIII, instantiate: false},

    [CardName.SMUGGLED_REACTOR_CORE]: {Factory: SmuggledReactorCore, instantiate: false},
    [CardName.SMUGGLED_REACTOR_CORE_II]: {Factory: SmuggledReactorCoreII, instantiate: false},
    [CardName.SMUGGLED_REACTOR_CORE_III]: {Factory: SmuggledReactorCoreIII, instantiate: false},

    [CardName.POACHED_SPECIMENS]: {Factory: PoachedSpecimens, instantiate: false},
    [CardName.POACHED_SPECIMENS_II]: {Factory: PoachedSpecimensII, instantiate: false},
    [CardName.POACHED_SPECIMENS_III]: {Factory: PoachedSpecimensIII, instantiate: false},

    [CardName.COUNTERFEIT_CERTIFICATES]: {Factory: CounterfeitCertificates, instantiate: false},
    [CardName.COUNTERFEIT_CERTIFICATES_II]: {Factory: CounterfeitCertificatesII, instantiate: false},
    [CardName.COUNTERFEIT_CERTIFICATES_III]: {Factory: CounterfeitCertificatesIII, instantiate: false},

    [CardName.BLACK_ICE_HACKER]: {Factory: BlackIceHacker, instantiate: false},
    [CardName.BLACK_ICE_HACKER_II]: {Factory: BlackIceHackerII, instantiate: false},
    [CardName.BLACK_ICE_HACKER_III]: {Factory: BlackIceHackerIII, instantiate: false},

    [CardName.PIRATE_TRADE_ROUTE]: {Factory: PirateTradeRoute, instantiate: false},
    [CardName.PIRATE_TRADE_ROUTE_II]: {Factory: PirateTradeRouteII, instantiate: false},
    [CardName.PIRATE_TRADE_ROUTE_III]: {Factory: PirateTradeRouteIII, instantiate: false},

    // Crime tag -- requires Underworld, mirroring BlacklabCartel's per-card compatibility gate.
    [CardName.UNDERGROUND_CASINO]: {Factory: UndergroundCasino, instantiate: false, compatibility: 'underworld'},
    [CardName.UNDERGROUND_CASINO_II]: {Factory: UndergroundCasinoII, instantiate: false, compatibility: 'underworld'},
    [CardName.UNDERGROUND_CASINO_III]: {Factory: UndergroundCasinoIII, instantiate: false, compatibility: 'underworld'},

    [CardName.BOOTLEG_TERRAFORMING_FORMULA]: {Factory: BootlegTerraformingFormula, instantiate: false},
    [CardName.BOOTLEG_TERRAFORMING_FORMULA_II]: {Factory: BootlegTerraformingFormulaII, instantiate: false},
    [CardName.BOOTLEG_TERRAFORMING_FORMULA_III]: {Factory: BootlegTerraformingFormulaIII, instantiate: false},

    [CardName.STOLEN_BLUEPRINTS]: {Factory: StolenBlueprints, instantiate: false},
    [CardName.STOLEN_BLUEPRINTS_II]: {Factory: StolenBlueprintsII, instantiate: false},
    [CardName.STOLEN_BLUEPRINTS_III]: {Factory: StolenBlueprintsIII, instantiate: false},

    [CardName.ILLICIT_MINING_OP]: {Factory: IllicitMiningOp, instantiate: false},
    [CardName.ILLICIT_MINING_OP_II]: {Factory: IllicitMiningOpII, instantiate: false},
    [CardName.ILLICIT_MINING_OP_III]: {Factory: IllicitMiningOpIII, instantiate: false},

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

    [CardName.CARTEL_REFINERY]: {Factory: CartelRefinery, instantiate: false},
    [CardName.CARTEL_REFINERY_II]: {Factory: CartelRefineryII, instantiate: false},
    [CardName.CARTEL_REFINERY_III]: {Factory: CartelRefineryIII, instantiate: false},

    [CardName.BLACKSITE_EXCAVATION]: {Factory: BlacksiteExcavation, instantiate: false},
    [CardName.BLACKSITE_EXCAVATION_II]: {Factory: BlacksiteExcavationII, instantiate: false},
    [CardName.BLACKSITE_EXCAVATION_III]: {Factory: BlacksiteExcavationIII, instantiate: false},

    [CardName.GREENHOUSE_LAUNDERING]: {Factory: GreenhouseLaundering, instantiate: false},
    [CardName.GREENHOUSE_LAUNDERING_II]: {Factory: GreenhouseLaunderingII, instantiate: false},
    [CardName.GREENHOUSE_LAUNDERING_III]: {Factory: GreenhouseLaunderingIII, instantiate: false},

    [CardName.VENT_TAP_SYNDICATE]: {Factory: VentTapSyndicate, instantiate: false},
    [CardName.VENT_TAP_SYNDICATE_II]: {Factory: VentTapSyndicateII, instantiate: false},
    [CardName.VENT_TAP_SYNDICATE_III]: {Factory: VentTapSyndicateIII, instantiate: false},

    [CardName.BLACK_MARKET_TERRAFORMER]: {Factory: BlackMarketTerraformer, instantiate: false},
    [CardName.BLACK_MARKET_TERRAFORMER_II]: {Factory: BlackMarketTerraformerII, instantiate: false},
    [CardName.BLACK_MARKET_TERRAFORMER_III]: {Factory: BlackMarketTerraformerIII, instantiate: false},

    [CardName.ROGUE_TERRAFORMING_CARTEL]: {Factory: RogueTerraformingCartel, instantiate: false},
    [CardName.ROGUE_TERRAFORMING_CARTEL_II]: {Factory: RogueTerraformingCartelII, instantiate: false},
    [CardName.ROGUE_TERRAFORMING_CARTEL_III]: {Factory: RogueTerraformingCartelIII, instantiate: false},
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
  /** The 3 CardName printings, in reveal order -- see CardName.ts's Black Market comment. */
  printings: readonly [CardName, CardName, CardName];
  /**
   * The numeric knob that escalates cheapest-to-priciest across the 3 printings -- almost
   * always the cost of the design's main resource, but for a couple of designs (e.g. Poached
   * Specimens) it's the size of the *reward* instead, since their cost is flat across all 3.
   */
  variants: readonly [number, number, number];
  /** Constructs `name` with the given printing's numeric knob. */
  build: (name: CardName, param: number) => IProjectCard;
};

export const BLACK_MARKET_DESIGNS: ReadonlyArray<BlackMarketDesign> = [
  // Early game (generation 1+)
  {
    tier: 'early',
    printings: [CardName.CLASSIFIED_RESEARCH, CardName.CLASSIFIED_RESEARCH_II, CardName.CLASSIFIED_RESEARCH_III],
    variants: [7, 8, 9],
    build: (name, cost) => new ClassifiedResearch(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.URANIUM_SMUGGLE, CardName.URANIUM_SMUGGLE_II, CardName.URANIUM_SMUGGLE_III],
    variants: [8, 9, 10],
    build: (name, cost) => new UraniumSmuggle(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.SMUGGLED_REACTOR_CORE, CardName.SMUGGLED_REACTOR_CORE_II, CardName.SMUGGLED_REACTOR_CORE_III],
    variants: [2, 3, 4],
    build: (name, titanium) => new SmuggledReactorCore(name, titanium),
  },
  {
    tier: 'early',
    printings: [CardName.POACHED_SPECIMENS, CardName.POACHED_SPECIMENS_II, CardName.POACHED_SPECIMENS_III],
    variants: [7, 8, 9],
    build: (name, megacredits) => new PoachedSpecimens(name, megacredits),
  },
  {
    tier: 'early',
    printings: [CardName.COUNTERFEIT_CERTIFICATES, CardName.COUNTERFEIT_CERTIFICATES_II, CardName.COUNTERFEIT_CERTIFICATES_III],
    variants: [1, 2, 3],
    build: (name, heat) => new CounterfeitCertificates(name, heat),
  },
  {
    tier: 'early',
    printings: [CardName.BLACK_ICE_HACKER, CardName.BLACK_ICE_HACKER_II, CardName.BLACK_ICE_HACKER_III],
    variants: [2, 3, 4],
    build: (name, energy) => new BlackIceHacker(name, energy),
  },
  {
    tier: 'early',
    printings: [CardName.PIRATE_TRADE_ROUTE, CardName.PIRATE_TRADE_ROUTE_II, CardName.PIRATE_TRADE_ROUTE_III],
    variants: [1, 2, 3],
    build: (name, titanium) => new PirateTradeRoute(name, titanium),
  },
  {
    tier: 'early',
    printings: [CardName.UNDERGROUND_CASINO, CardName.UNDERGROUND_CASINO_II, CardName.UNDERGROUND_CASINO_III],
    variants: [10, 11, 12],
    build: (name, cost) => new UndergroundCasino(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.BOOTLEG_TERRAFORMING_FORMULA, CardName.BOOTLEG_TERRAFORMING_FORMULA_II, CardName.BOOTLEG_TERRAFORMING_FORMULA_III],
    variants: [4, 5, 6],
    build: (name, cost) => new BootlegTerraformingFormula(name, cost),
  },
  {
    tier: 'early',
    printings: [CardName.STOLEN_BLUEPRINTS, CardName.STOLEN_BLUEPRINTS_II, CardName.STOLEN_BLUEPRINTS_III],
    variants: [2, 3, 4],
    build: (name, steel) => new StolenBlueprints(name, steel),
  },
  {
    tier: 'early',
    printings: [CardName.ILLICIT_MINING_OP, CardName.ILLICIT_MINING_OP_II, CardName.ILLICIT_MINING_OP_III],
    variants: [2, 3, 4],
    build: (name, energy) => new IllicitMiningOp(name, energy, energy + 2),
  },
  {
    tier: 'early',
    printings: [CardName.ROGUE_AI_CONTRACT, CardName.ROGUE_AI_CONTRACT_II, CardName.ROGUE_AI_CONTRACT_III],
    variants: [8, 9, 10],
    build: (name, cost) => new RogueAiContract(name, cost),
  },

  // Mid game (generation 4+)
  {
    tier: 'mid',
    printings: [CardName.ORE_FOR_OXYGEN_RACKET, CardName.ORE_FOR_OXYGEN_RACKET_II, CardName.ORE_FOR_OXYGEN_RACKET_III],
    variants: [3, 4, 5],
    build: (name, steel) => new OreForOxygenRacket(name, steel),
  },
  {
    tier: 'mid',
    printings: [CardName.MELTDOWN_CONTRACT, CardName.MELTDOWN_CONTRACT_II, CardName.MELTDOWN_CONTRACT_III],
    variants: [3, 4, 5],
    build: (name, titanium) => new MeltdownContract(name, titanium),
  },
  {
    tier: 'mid',
    printings: [CardName.COMPOST_SYNDICATE, CardName.COMPOST_SYNDICATE_II, CardName.COMPOST_SYNDICATE_III],
    variants: [3, 4, 5],
    build: (name, plants) => new CompostSyndicate(name, plants, plants + 2),
  },
  {
    tier: 'mid',
    printings: [CardName.GEOTHERMAL_KICKBACK, CardName.GEOTHERMAL_KICKBACK_II, CardName.GEOTHERMAL_KICKBACK_III],
    variants: [5, 6, 7],
    build: (name, heat) => new GeothermalKickback(name, heat),
  },
  {
    tier: 'mid',
    printings: [CardName.SMUGGLED_SEED_VAULT, CardName.SMUGGLED_SEED_VAULT_II, CardName.SMUGGLED_SEED_VAULT_III],
    variants: [4, 5, 6],
    build: (name, plants) => new SmuggledSeedVault(name, plants),
  },
  {
    tier: 'mid',
    printings: [CardName.HEAVY_METAL_HUSTLE, CardName.HEAVY_METAL_HUSTLE_II, CardName.HEAVY_METAL_HUSTLE_III],
    variants: [3, 4, 5],
    build: (name, titanium) => new HeavyMetalHustle(name, titanium),
  },

  // Late game (generation 7+)
  {
    tier: 'late',
    printings: [CardName.CARTEL_REFINERY, CardName.CARTEL_REFINERY_II, CardName.CARTEL_REFINERY_III],
    variants: [5, 6, 7],
    build: (name, steel) => new CartelRefinery(name, steel),
  },
  {
    tier: 'late',
    printings: [CardName.BLACKSITE_EXCAVATION, CardName.BLACKSITE_EXCAVATION_II, CardName.BLACKSITE_EXCAVATION_III],
    variants: [5, 6, 7],
    build: (name, titanium) => new BlacksiteExcavation(name, titanium),
  },
  {
    tier: 'late',
    printings: [CardName.GREENHOUSE_LAUNDERING, CardName.GREENHOUSE_LAUNDERING_II, CardName.GREENHOUSE_LAUNDERING_III],
    variants: [6, 7, 8],
    build: (name, plants) => new GreenhouseLaundering(name, plants, plants + 2),
  },
  {
    tier: 'late',
    printings: [CardName.VENT_TAP_SYNDICATE, CardName.VENT_TAP_SYNDICATE_II, CardName.VENT_TAP_SYNDICATE_III],
    variants: [7, 8, 9],
    build: (name, heat) => new VentTapSyndicate(name, heat),
  },
  {
    tier: 'late',
    printings: [CardName.BLACK_MARKET_TERRAFORMER, CardName.BLACK_MARKET_TERRAFORMER_II, CardName.BLACK_MARKET_TERRAFORMER_III],
    variants: [5, 6, 7],
    build: (name, plants) => new BlackMarketTerraformer(name, plants),
  },
  {
    tier: 'late',
    printings: [CardName.ROGUE_TERRAFORMING_CARTEL, CardName.ROGUE_TERRAFORMING_CARTEL_II, CardName.ROGUE_TERRAFORMING_CARTEL_III],
    variants: [4, 5, 6],
    build: (name, titanium) => new RogueTerraformingCartel(name, titanium),
  },
];
