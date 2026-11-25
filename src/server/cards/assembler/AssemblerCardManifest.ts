import {ModuleManifest} from '../ModuleManifest';
import {CardName} from '../../../common/cards/CardName';
import {AssemblyLine} from './AssemblyLine';
import {PrototypeWorkshop} from './PrototypeWorkshop';
import {SalvageYard} from './SalvageYard';
import {ModularFactory} from './ModularFactory';
import {ResearchPrototype} from './ResearchPrototype';
import {OpenSourceBlueprints} from './OpenSourceBlueprints';
import {QuadCoreChassis} from './QuadCoreChassis';
import {AssemblyRobots} from './AssemblyRobots';
import {ReverseEngineering} from './ReverseEngineering';
import {SpecializedFabricator} from './SpecializedFabricator';
import {VenturePrototype} from './VenturePrototype';
import {ProductionRun} from './ProductionRun';
import {HallOfPrototypes} from './HallOfPrototypes';
import {BargainBin} from './BargainBin';

/**
 * Assembler (fan): the printed cards that use the Assemble keyword. The cards Assemble creates
 * aren't listed here -- they're generated during each game (see src/server/assembler/).
 */
export const ASSEMBLER_CARD_MANIFEST = new ModuleManifest({
  module: 'assembler',
  projectCards: {
    [CardName.ASSEMBLY_LINE]: {Factory: AssemblyLine},
    [CardName.PROTOTYPE_WORKSHOP]: {Factory: PrototypeWorkshop},
    [CardName.SALVAGE_YARD]: {Factory: SalvageYard},
    [CardName.MODULAR_FACTORY]: {Factory: ModularFactory},
    [CardName.RESEARCH_PROTOTYPE]: {Factory: ResearchPrototype},
    [CardName.OPEN_SOURCE_BLUEPRINTS]: {Factory: OpenSourceBlueprints},
    [CardName.QUAD_CORE_CHASSIS]: {Factory: QuadCoreChassis},
    [CardName.ASSEMBLY_ROBOTS]: {Factory: AssemblyRobots},
    [CardName.REVERSE_ENGINEERING]: {Factory: ReverseEngineering},
    [CardName.SPECIALIZED_FABRICATOR]: {Factory: SpecializedFabricator},
    [CardName.VENTURE_PROTOTYPE]: {Factory: VenturePrototype},
    [CardName.PRODUCTION_RUN]: {Factory: ProductionRun},
    [CardName.HALL_OF_PROTOTYPES]: {Factory: HallOfPrototypes},
    [CardName.BARGAIN_BIN]: {Factory: BargainBin},
  },
});
