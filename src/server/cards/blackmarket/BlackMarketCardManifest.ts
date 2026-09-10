import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {BlackMarketPrice} from '../../../common/blackmarket/BlackMarketPrice';
import {Random} from '../../../common/utils/Random';
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
 * A design's price lives here, on the market, not on the card (`Card.ts`'s own `cost`/
 * `reserveUnits` are always 0/empty for every Black Market card -- see each card file).
 * `fixed` gives each of the 3 printings its own price, read off by the printing's index in
 * `BlackMarketDesign.printings` -- by convention listed cheapest-to-priciest, so a design's
 * stack gets pricier as it's bought down (the escalation the user asked for). `variable`
 * rolls a fresh M€ price in `[minCost, maxCost]` every time any printing of that design is
 * revealed, independent of which printing it is.
 */
export type BlackMarketPriceSpec =
  | {kind: 'fixed', variants: readonly [BlackMarketPrice, BlackMarketPrice, BlackMarketPrice]}
  | {kind: 'variable', minCost: number, maxCost: number};

export function resolveBlackMarketPrice(spec: BlackMarketPriceSpec, variantIndex: number, rng: Random): BlackMarketPrice {
  if (spec.kind === 'variable') {
    return {megacredits: spec.minCost + rng.nextInt(spec.maxCost - spec.minCost + 1)};
  }
  return spec.variants[variantIndex];
}

export type BlackMarketDesign = {
  /** The 3 CardName printings, in reveal order -- see CardName.ts's Black Market comment. */
  printings: readonly [CardName, CardName, CardName];
  price: BlackMarketPriceSpec;
};

export const BLACK_MARKET_DESIGNS: ReadonlyArray<BlackMarketDesign> = [
  {
    printings: [CardName.CLASSIFIED_RESEARCH, CardName.CLASSIFIED_RESEARCH_II, CardName.CLASSIFIED_RESEARCH_III],
    price: {kind: 'variable', minCost: 7, maxCost: 9},
  },
  {
    printings: [CardName.URANIUM_SMUGGLE, CardName.URANIUM_SMUGGLE_II, CardName.URANIUM_SMUGGLE_III],
    price: {kind: 'variable', minCost: 8, maxCost: 11},
  },
  {
    printings: [CardName.SMUGGLED_REACTOR_CORE, CardName.SMUGGLED_REACTOR_CORE_II, CardName.SMUGGLED_REACTOR_CORE_III],
    price: {kind: 'fixed', variants: [{titanium: 2}, {titanium: 3}, {titanium: 4}]},
  },
  {
    printings: [CardName.POACHED_SPECIMENS, CardName.POACHED_SPECIMENS_II, CardName.POACHED_SPECIMENS_III],
    price: {kind: 'fixed', variants: [{plants: 1, energy: 2}, {plants: 2, energy: 2}, {plants: 3, energy: 2}]},
  },
  {
    printings: [CardName.COUNTERFEIT_CERTIFICATES, CardName.COUNTERFEIT_CERTIFICATES_II, CardName.COUNTERFEIT_CERTIFICATES_III],
    price: {kind: 'fixed', variants: [{megacredits: 2, heat: 1}, {megacredits: 2, heat: 2}, {megacredits: 2, heat: 3}]},
  },
  {
    printings: [CardName.BLACK_ICE_HACKER, CardName.BLACK_ICE_HACKER_II, CardName.BLACK_ICE_HACKER_III],
    price: {kind: 'fixed', variants: [{energy: 3}, {energy: 4}, {energy: 5}]},
  },
  {
    printings: [CardName.PIRATE_TRADE_ROUTE, CardName.PIRATE_TRADE_ROUTE_II, CardName.PIRATE_TRADE_ROUTE_III],
    price: {kind: 'fixed', variants: [{steel: 1, titanium: 1}, {steel: 1, titanium: 2}, {steel: 1, titanium: 3}]},
  },
  {
    printings: [CardName.UNDERGROUND_CASINO, CardName.UNDERGROUND_CASINO_II, CardName.UNDERGROUND_CASINO_III],
    price: {kind: 'fixed', variants: [{megacredits: 10}, {megacredits: 11}, {megacredits: 12}]},
  },
  {
    printings: [CardName.BOOTLEG_TERRAFORMING_FORMULA, CardName.BOOTLEG_TERRAFORMING_FORMULA_II, CardName.BOOTLEG_TERRAFORMING_FORMULA_III],
    price: {kind: 'variable', minCost: 6, maxCost: 9},
  },
  {
    printings: [CardName.STOLEN_BLUEPRINTS, CardName.STOLEN_BLUEPRINTS_II, CardName.STOLEN_BLUEPRINTS_III],
    price: {kind: 'fixed', variants: [{steel: 2}, {steel: 3}, {steel: 4}]},
  },
  {
    printings: [CardName.ILLICIT_MINING_OP, CardName.ILLICIT_MINING_OP_II, CardName.ILLICIT_MINING_OP_III],
    price: {kind: 'fixed', variants: [{energy: 2}, {energy: 3}, {energy: 4}]},
  },
  {
    printings: [CardName.ROGUE_AI_CONTRACT, CardName.ROGUE_AI_CONTRACT_II, CardName.ROGUE_AI_CONTRACT_III],
    price: {kind: 'variable', minCost: 10, maxCost: 14},
  },
];
