import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {LunarBeamBetterMars} from './LunarBeamBetterMars';
import {LunaMetropolisBetterMars} from './LunaMetropolisBetterMars';
import {LunarExportsBetterMars} from './LunarExportsBetterMars';
import {PristarBetterMars} from './PristarBetterMars';
import {EarlySettlementBetterMars} from './EarlySettlementBetterMars';
import {SelfSufficientSettlementBetterMars} from './SelfSufficientSettlementBetterMars';
import {EosChasmaNationalParkBetterMars} from './EosChasmaNationalParkBetterMars';
import {ImmigrationShuttlesBetterMars} from './ImmigrationShuttlesBetterMars';
import {MartianRailsBetterMars} from './MartianRailsBetterMars';
import {NoctisCityBetterMars} from './NoctisCityBetterMars';
import {NoctisFarmingBetterMars} from './NoctisFarmingBetterMars';
import {ProtectedValleyBetterMars} from './ProtectedValleyBetterMars';
import {MarsUniversityBetterMars} from './MarsUniversityBetterMars';
import {ProtectedHabitatsBetterMars} from './ProtectedHabitatsBetterMars';
import {TropicalResortBetterMars} from './TropicalResortBetterMars';
import {MartianMediaCenterBetterMars} from './MartianMediaCenterBetterMars';

/**
 * BetterMars: replaces a handful of official cards with Mars-flavoured variants
 * (an extra Mars tag, or an Earth tag turned into a Moon tag). The base cards are
 * swapped out via `cardsToRemove` whenever this module is enabled.
 */
export const BETTER_MARS_CARD_MANIFEST = new ModuleManifest({
  module: 'betterMars',
  corporationCards: {
    [CardName.PRISTAR_BETTER_MARS]: {Factory: PristarBetterMars, compatibility: 'turmoil'},
  },
  preludeCards: {
    [CardName.EARLY_SETTLEMENT_BETTER_MARS]: {Factory: EarlySettlementBetterMars, compatibility: 'prelude'},
    [CardName.SELF_SUFFICIENT_SETTLEMENT_BETTER_MARS]: {Factory: SelfSufficientSettlementBetterMars, compatibility: 'prelude'},
  },
  projectCards: {
    [CardName.LUNAR_BEAM_BETTER_MARS]: {Factory: LunarBeamBetterMars},
    [CardName.LUNA_METROPOLIS_BETTER_MARS]: {Factory: LunaMetropolisBetterMars, compatibility: 'venus'},
    [CardName.LUNAR_EXPORTS_BETTER_MARS]: {Factory: LunarExportsBetterMars, compatibility: 'colonies'},
    [CardName.EOS_CHASMA_NATIONAL_PARK_BETTER_MARS]: {Factory: EosChasmaNationalParkBetterMars},
    [CardName.IMMIGRATION_SHUTTLES_BETTER_MARS]: {Factory: ImmigrationShuttlesBetterMars},
    [CardName.MARTIAN_RAILS_BETTER_MARS]: {Factory: MartianRailsBetterMars},
    [CardName.NOCTIS_CITY_BETTER_MARS]: {Factory: NoctisCityBetterMars},
    [CardName.NOCTIS_FARMING_BETTER_MARS]: {Factory: NoctisFarmingBetterMars},
    [CardName.PROTECTED_VALLEY_BETTER_MARS]: {Factory: ProtectedValleyBetterMars},
    [CardName.MARS_UNIVERSITY_BETTER_MARS]: {Factory: MarsUniversityBetterMars},
    [CardName.PROTECTED_HABITATS_BETTER_MARS]: {Factory: ProtectedHabitatsBetterMars},
    [CardName.TROPICAL_RESORT_BETTER_MARS]: {Factory: TropicalResortBetterMars},
    [CardName.MARTIAN_MEDIA_CENTER_BETTER_MARS]: {Factory: MartianMediaCenterBetterMars, compatibility: 'turmoil'},
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
