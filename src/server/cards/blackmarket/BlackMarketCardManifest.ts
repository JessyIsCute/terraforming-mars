import {CardName} from '../../../common/cards/CardName';
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

/**
 * Every Black Market design's 3 printings, registered `instantiate: false` so they're never
 * shuffled into the normal shared project deck (`GameCards.instantiate()`) but remain
 * constructible by name -- `BlackMarket.ts`'s own dealing logic pulls cards directly by name
 * (rolling a fresh price for the handful of variable-cost designs), and `createCard.ts`'s
 * manifest scan covers reconstructing a market slot after a game reload.
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
  },
});

/** Every Black Market printing's `CardName`, grouped by design -- the market's shuffled draw pile. */
export const BLACK_MARKET_PRINTINGS: ReadonlyArray<ReadonlyArray<CardName>> = [
  [CardName.CLASSIFIED_RESEARCH, CardName.CLASSIFIED_RESEARCH_II, CardName.CLASSIFIED_RESEARCH_III],
  [CardName.URANIUM_SMUGGLE, CardName.URANIUM_SMUGGLE_II, CardName.URANIUM_SMUGGLE_III],
  [CardName.SMUGGLED_REACTOR_CORE, CardName.SMUGGLED_REACTOR_CORE_II, CardName.SMUGGLED_REACTOR_CORE_III],
  [CardName.POACHED_SPECIMENS, CardName.POACHED_SPECIMENS_II, CardName.POACHED_SPECIMENS_III],
  [CardName.COUNTERFEIT_CERTIFICATES, CardName.COUNTERFEIT_CERTIFICATES_II, CardName.COUNTERFEIT_CERTIFICATES_III],
  [CardName.BLACK_ICE_HACKER, CardName.BLACK_ICE_HACKER_II, CardName.BLACK_ICE_HACKER_III],
  [CardName.PIRATE_TRADE_ROUTE, CardName.PIRATE_TRADE_ROUTE_II, CardName.PIRATE_TRADE_ROUTE_III],
  [CardName.UNDERGROUND_CASINO, CardName.UNDERGROUND_CASINO_II, CardName.UNDERGROUND_CASINO_III],
  [CardName.BOOTLEG_TERRAFORMING_FORMULA, CardName.BOOTLEG_TERRAFORMING_FORMULA_II, CardName.BOOTLEG_TERRAFORMING_FORMULA_III],
  [CardName.STOLEN_BLUEPRINTS, CardName.STOLEN_BLUEPRINTS_II, CardName.STOLEN_BLUEPRINTS_III],
  [CardName.ILLICIT_MINING_OP, CardName.ILLICIT_MINING_OP_II, CardName.ILLICIT_MINING_OP_III],
  [CardName.ROGUE_AI_CONTRACT, CardName.ROGUE_AI_CONTRACT_II, CardName.ROGUE_AI_CONTRACT_III],
];
