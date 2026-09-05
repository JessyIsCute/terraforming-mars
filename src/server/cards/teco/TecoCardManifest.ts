import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {MoonCow} from './MoonCow';
import {UndergroundWorms} from './UndergroundWorms';
import {Venuphile} from './Venuphile';
import {TagTaxer} from './TagTaxer';
import {Amphibians} from './Amphibians';
import {ColdBlooded} from './ColdBlooded';
import {SpaceOffice} from './SpaceOffice';
import {PlantEater} from './PlantEater';
import {SmeltingPods} from './SmeltingPods';
import {Manuwhack} from './Manuwhack';
import {BurnTheForest} from './BurnTheForest';
import {Cats} from './Cats';
import {GenerousRedistribution} from './GenerousRedistribution';
import {SlowStart} from './SlowStart';
import {PreludeGambit} from './PreludeGambit';
import {Balance} from './Balance';
import {MarsHomesteadAct} from './MarsHomesteadAct';
import {InsiderTrading} from './InsiderTrading';
import {MarketCrash} from './MarketCrash';
import {SharedKnowledge} from './SharedKnowledge';
import {SpireTech} from './SpireTech';
import {AnimalShelter} from './AnimalShelter';
import {Jupiter} from './Jupiter';
import {GamblingProblem} from './GamblingProblem';
import {RawEnergy} from './RawEnergy';
import {PureEnergy} from './PureEnergy';
import {Insurance} from './Insurance';
import {EnergyHarvest} from './EnergyHarvest';
import {Electrobic} from './Electrobic';
import {Microbetronics} from './Microbetronics';
import {Microbitic} from './Microbitic';
import {ResearchPhase} from './ResearchPhase';
import {Blockhouse} from './Blockhouse';
import {Mulligangs} from './Mulligangs';
import {Mulligens} from './Mulligens';

/** Teco: an original fan expansion of project cards and preludes. Icon: a "T" in a circle. */
export const TECO_CARD_MANIFEST = new ModuleManifest({
  module: 'teco',
  projectCards: {
    [CardName.MOON_COW]: {Factory: MoonCow, compatibility: 'moon'},
    [CardName.UNDERGROUND_WORMS]: {Factory: UndergroundWorms, compatibility: 'underworld'},
    [CardName.VENUPHILE]: {Factory: Venuphile, compatibility: 'venus'},
    [CardName.TAG_TAXER]: {Factory: TagTaxer},
    [CardName.AMPHIBIANS]: {Factory: Amphibians},
    [CardName.COLD_BLOODED]: {Factory: ColdBlooded},
    [CardName.SPACE_OFFICE]: {Factory: SpaceOffice},
    [CardName.PLANT_EATER]: {Factory: PlantEater},
    [CardName.SMELTING_PODS]: {Factory: SmeltingPods},
    [CardName.MANUWHACK]: {Factory: Manuwhack},
    [CardName.BURN_THE_FOREST]: {Factory: BurnTheForest},
    [CardName.CATS]: {Factory: Cats},
    [CardName.SHARED_KNOWLEDGE]: {Factory: SharedKnowledge},
    [CardName.SPIRE_TECH]: {Factory: SpireTech},
    [CardName.ANIMAL_SHELTER]: {Factory: AnimalShelter},
    [CardName.JUPITER]: {Factory: Jupiter},
    [CardName.GAMBLING_PROBLEM]: {Factory: GamblingProblem},
    [CardName.RAW_ENERGY]: {Factory: RawEnergy},
    [CardName.PURE_ENERGY]: {Factory: PureEnergy},
    [CardName.INSURANCE]: {Factory: Insurance, compatibility: 'turmoil'},
    [CardName.ENERGY_HARVEST]: {Factory: EnergyHarvest},
    [CardName.ELECTROBIC]: {Factory: Electrobic},
    [CardName.MICROBETRONICS]: {Factory: Microbetronics},
    [CardName.MICROBITIC]: {Factory: Microbitic},
    [CardName.RESEARCH_PHASE]: {Factory: ResearchPhase},
    [CardName.BLOCKHOUSE]: {Factory: Blockhouse},
    [CardName.MULLIGANGS]: {Factory: Mulligangs},
    [CardName.MULLIGENS]: {Factory: Mulligens},
  },
  preludeCards: {
    [CardName.GENEROUS_REDISTRIBUTION]: {Factory: GenerousRedistribution, compatibility: 'prelude'},
    [CardName.SLOW_START]: {Factory: SlowStart, compatibility: 'prelude'},
    [CardName.PRELUDE_GAMBIT]: {Factory: PreludeGambit, compatibility: 'prelude'},
    [CardName.BALANCE]: {Factory: Balance, compatibility: 'prelude'},
    [CardName.MARS_HOMESTEAD_ACT]: {Factory: MarsHomesteadAct, compatibility: 'prelude'},
    [CardName.INSIDER_TRADING]: {Factory: InsiderTrading, compatibility: ['prelude', 'underworld']},
    [CardName.MARKET_CRASH]: {Factory: MarketCrash, compatibility: 'prelude'},
  },
});
