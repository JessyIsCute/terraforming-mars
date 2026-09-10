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

/**
 * Price lives on the card itself again (each printing's own `cost`/`reserveUnits`, set via
 * its constructor's numeric param) -- this table exists only so `BlackMarket.ts` knows, for
 * a `fixed` design, which literal param each of the 3 printings defaults to anyway (used
 * only to describe the design when initially picking a card off the queue -- the printing's
 * OWN constructor default already bakes in the right value), and for a `variable` design,
 * what range to roll a fresh param from every time any printing is revealed.
 */
export type BlackMarketPriceSpec =
  | {kind: 'fixed', variants: readonly [number, number, number]}
  | {kind: 'variable', minCost: number, maxCost: number};

export type BlackMarketDesign = {
  /** The 3 CardName printings, in reveal order -- see CardName.ts's Black Market comment. */
  printings: readonly [CardName, CardName, CardName];
  price: BlackMarketPriceSpec;
  /** Constructs `name` with the given numeric price param (a resource count for `fixed`, an M€ cost for `variable`). */
  build: (name: CardName, param: number) => IProjectCard;
};

export const BLACK_MARKET_DESIGNS: ReadonlyArray<BlackMarketDesign> = [
  {
    printings: [CardName.CLASSIFIED_RESEARCH, CardName.CLASSIFIED_RESEARCH_II, CardName.CLASSIFIED_RESEARCH_III],
    price: {kind: 'variable', minCost: 7, maxCost: 9},
    build: (name, cost) => new ClassifiedResearch(name, cost),
  },
  {
    printings: [CardName.URANIUM_SMUGGLE, CardName.URANIUM_SMUGGLE_II, CardName.URANIUM_SMUGGLE_III],
    price: {kind: 'variable', minCost: 8, maxCost: 11},
    build: (name, cost) => new UraniumSmuggle(name, cost),
  },
  {
    printings: [CardName.SMUGGLED_REACTOR_CORE, CardName.SMUGGLED_REACTOR_CORE_II, CardName.SMUGGLED_REACTOR_CORE_III],
    price: {kind: 'fixed', variants: [2, 3, 4]},
    build: (name, titanium) => new SmuggledReactorCore(name, titanium),
  },
  {
    printings: [CardName.POACHED_SPECIMENS, CardName.POACHED_SPECIMENS_II, CardName.POACHED_SPECIMENS_III],
    price: {kind: 'fixed', variants: [1, 2, 3]},
    build: (name, plants) => new PoachedSpecimens(name, plants),
  },
  {
    printings: [CardName.COUNTERFEIT_CERTIFICATES, CardName.COUNTERFEIT_CERTIFICATES_II, CardName.COUNTERFEIT_CERTIFICATES_III],
    price: {kind: 'fixed', variants: [1, 2, 3]},
    build: (name, heat) => new CounterfeitCertificates(name, heat),
  },
  {
    printings: [CardName.BLACK_ICE_HACKER, CardName.BLACK_ICE_HACKER_II, CardName.BLACK_ICE_HACKER_III],
    price: {kind: 'fixed', variants: [3, 4, 5]},
    build: (name, energy) => new BlackIceHacker(name, energy),
  },
  {
    printings: [CardName.PIRATE_TRADE_ROUTE, CardName.PIRATE_TRADE_ROUTE_II, CardName.PIRATE_TRADE_ROUTE_III],
    price: {kind: 'fixed', variants: [1, 2, 3]},
    build: (name, titanium) => new PirateTradeRoute(name, titanium),
  },
  {
    printings: [CardName.UNDERGROUND_CASINO, CardName.UNDERGROUND_CASINO_II, CardName.UNDERGROUND_CASINO_III],
    price: {kind: 'fixed', variants: [10, 11, 12]},
    build: (name, cost) => new UndergroundCasino(name, cost),
  },
  {
    printings: [CardName.BOOTLEG_TERRAFORMING_FORMULA, CardName.BOOTLEG_TERRAFORMING_FORMULA_II, CardName.BOOTLEG_TERRAFORMING_FORMULA_III],
    price: {kind: 'variable', minCost: 6, maxCost: 9},
    build: (name, cost) => new BootlegTerraformingFormula(name, cost),
  },
  {
    printings: [CardName.STOLEN_BLUEPRINTS, CardName.STOLEN_BLUEPRINTS_II, CardName.STOLEN_BLUEPRINTS_III],
    price: {kind: 'fixed', variants: [2, 3, 4]},
    build: (name, steel) => new StolenBlueprints(name, steel),
  },
  {
    printings: [CardName.ILLICIT_MINING_OP, CardName.ILLICIT_MINING_OP_II, CardName.ILLICIT_MINING_OP_III],
    price: {kind: 'fixed', variants: [2, 3, 4]},
    build: (name, energy) => new IllicitMiningOp(name, energy),
  },
  {
    printings: [CardName.ROGUE_AI_CONTRACT, CardName.ROGUE_AI_CONTRACT_II, CardName.ROGUE_AI_CONTRACT_III],
    price: {kind: 'variable', minCost: 10, maxCost: 14},
    build: (name, cost) => new RogueAiContract(name, cost),
  },
];
