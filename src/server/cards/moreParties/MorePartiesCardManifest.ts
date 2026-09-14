import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';
import {ModuleManifest} from '../ModuleManifest';
import {InterstellarSignal} from '../../turmoil/globalEvents/moreParties/InterstellarSignal';
import {KuipersExpansion} from '../../turmoil/globalEvents/moreParties/KuipersExpansion';
import {RadicalGeoengineering} from '../../turmoil/globalEvents/moreParties/RadicalGeoengineering';
import {LifeExtension} from '../../turmoil/globalEvents/moreParties/LifeExtension';
import {LonelinessInACrowd} from '../../turmoil/globalEvents/moreParties/LonelinessInACrowd';
import {MarinersAgreements} from '../../turmoil/globalEvents/moreParties/MarinersAgreements';
import {OldEarthReserve} from '../../turmoil/globalEvents/moreParties/OldEarthReserve';
import {Overpopulation} from '../../turmoil/globalEvents/moreParties/Overpopulation';
import {PopulationCollapses} from '../../turmoil/globalEvents/moreParties/PopulationCollapses';
import {QuantumBreakthrough} from '../../turmoil/globalEvents/moreParties/QuantumBreakthrough';
import {SanctionOnTheOutskirts} from '../../turmoil/globalEvents/moreParties/SanctionOnTheOutskirts';
import {SpeciationOfHumanity} from '../../turmoil/globalEvents/moreParties/SpeciationOfHumanity';
import {UniversalUprising} from '../../turmoil/globalEvents/moreParties/UniversalUprising';
import {VenusVolcanism} from '../../turmoil/globalEvents/moreParties/VenusVolcanism';
import {AntiGovernmentSentiment} from '../../turmoil/globalEvents/moreParties/AntiGovernmentSentiment';
import {AtmosphericPorts} from '../../turmoil/globalEvents/moreParties/AtmosphericPorts';
import {BeltTighteningPolicy} from '../../turmoil/globalEvents/moreParties/BeltTighteningPolicy';
import {BlackSwanManifestation} from '../../turmoil/globalEvents/moreParties/BlackSwanManifestation';
import {BrainMachineCoupling} from '../../turmoil/globalEvents/moreParties/BrainMachineCoupling';
import {ClosedBiospheres} from '../../turmoil/globalEvents/moreParties/ClosedBiospheres';
import {Cybernetic} from '../../turmoil/globalEvents/moreParties/Cybernetic';
import {Digitalization} from '../../turmoil/globalEvents/moreParties/Digitalization';
import {ConstructionOfTheDysonSwarm} from '../../turmoil/globalEvents/moreParties/ConstructionOfTheDysonSwarm';
import {EffectsOfRadiation} from '../../turmoil/globalEvents/moreParties/EffectsOfRadiation';
import {EnergyEconomics} from '../../turmoil/globalEvents/moreParties/EnergyEconomics';
import {ExtraterrestrialPolitics} from '../../turmoil/globalEvents/moreParties/ExtraterrestrialPolitics';
import {Favoritism} from '../../turmoil/globalEvents/moreParties/Favoritism';
import {FinancialCrisis} from '../../turmoil/globalEvents/moreParties/FinancialCrisis';
import {IllegalOrbiting} from '../../turmoil/globalEvents/moreParties/IllegalOrbiting';
import {IndependentCarriers} from '../../turmoil/globalEvents/moreParties/IndependentCarriers';

/**
 * More Parties (fan): 30 new Global Events, each associated with one of the 6 new parties
 * (Populists, Spome, Empower, Bureaucrats, Centrists, Transhumanists) rather than the 6 official
 * ones -- see Turmoil.swapInParty for what happens when the referenced party isn't in play.
 */
export const MORE_PARTIES_CARD_MANIFEST = new ModuleManifest({
  module: 'moreParties',
  globalEvents: {
    [GlobalEventName.INTERSTELLAR_SIGNAL]: {Factory: InterstellarSignal},
    [GlobalEventName.KUIPERS_EXPANSION]: {Factory: KuipersExpansion},
    [GlobalEventName.RADICAL_GEOENGINEERING]: {Factory: RadicalGeoengineering},
    [GlobalEventName.LIFE_EXTENSION]: {Factory: LifeExtension},
    [GlobalEventName.LONELINESS_IN_A_CROWD]: {Factory: LonelinessInACrowd},
    [GlobalEventName.MARINERS_AGREEMENTS]: {Factory: MarinersAgreements},
    [GlobalEventName.OLD_EARTH_RESERVE]: {Factory: OldEarthReserve},
    [GlobalEventName.OVERPOPULATION]: {Factory: Overpopulation},
    [GlobalEventName.POPULATION_COLLAPSES]: {Factory: PopulationCollapses},
    [GlobalEventName.QUANTUM_BREAKTHROUGH]: {Factory: QuantumBreakthrough},
    [GlobalEventName.SANCTION_ON_THE_OUTSKIRTS]: {Factory: SanctionOnTheOutskirts},
    [GlobalEventName.SPECIATION_OF_HUMANITY]: {Factory: SpeciationOfHumanity},
    [GlobalEventName.UNIVERSAL_UPRISING]: {Factory: UniversalUprising},
    [GlobalEventName.VENUS_VOLCANISM]: {Factory: VenusVolcanism},
    [GlobalEventName.ANTI_GOVERNMENT_SENTIMENT]: {Factory: AntiGovernmentSentiment},
    [GlobalEventName.ATMOSPHERIC_PORTS]: {Factory: AtmosphericPorts},
    [GlobalEventName.BELT_TIGHTENING_POLICY]: {Factory: BeltTighteningPolicy},
    [GlobalEventName.BLACK_SWAN_MANIFESTATION]: {Factory: BlackSwanManifestation},
    [GlobalEventName.BRAIN_MACHINE_COUPLING]: {Factory: BrainMachineCoupling},
    [GlobalEventName.CLOSED_BIOSPHERES]: {Factory: ClosedBiospheres},
    [GlobalEventName.CYBERNETIC]: {Factory: Cybernetic},
    [GlobalEventName.DIGITALIZATION]: {Factory: Digitalization},
    [GlobalEventName.CONSTRUCTION_OF_THE_DYSON_SWARM]: {Factory: ConstructionOfTheDysonSwarm},
    [GlobalEventName.EFFECTS_OF_RADIATION]: {Factory: EffectsOfRadiation},
    [GlobalEventName.ENERGY_ECONOMICS]: {Factory: EnergyEconomics},
    [GlobalEventName.EXTRATERRESTRIAL_POLITICS]: {Factory: ExtraterrestrialPolitics},
    [GlobalEventName.FAVORITISM]: {Factory: Favoritism},
    [GlobalEventName.FINANCIAL_CRISIS]: {Factory: FinancialCrisis},
    [GlobalEventName.ILLEGAL_ORBITING]: {Factory: IllegalOrbiting},
    [GlobalEventName.INDEPENDENT_CARRIERS]: {Factory: IndependentCarriers},
  },
});
