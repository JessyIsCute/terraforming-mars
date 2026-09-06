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
import {MeatIndustryBetterMars} from './MeatIndustryBetterMars';

/**
 * BetterMars: replaces a handful of official cards with tag-variant reworks
 * (an extra Mars tag, an Earth tag turned into a Moon tag, an Animal tag added
 * to a meat-industry card, etc). The base cards are
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
    [CardName.LUNAR_BEAM_BETTER_MARS]: {Factory: LunarBeamBetterMars, compatibility: 'moon'},
    [CardName.LUNA_METROPOLIS_BETTER_MARS]: {Factory: LunaMetropolisBetterMars, compatibility: ['venus', 'moon']},
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
    [CardName.MEAT_INDUSTRY_BETTER_MARS]: {Factory: MeatIndustryBetterMars},
  },
  cardsToRemove: [
    CardName.EOS_CHASMA_NATIONAL_PARK,
    CardName.IMMIGRATION_SHUTTLES,
    CardName.MARTIAN_RAILS,
    CardName.NOCTIS_CITY,
    CardName.NOCTIS_FARMING,
    CardName.PROTECTED_VALLEY,
    CardName.MARS_UNIVERSITY,
    CardName.PROTECTED_HABITATS,
    CardName.TROPICAL_RESORT,
    CardName.MEAT_INDUSTRY,
  ],
  // These replacements each need an extra expansion on top of BetterMars itself (Moon,
  // Venus, Colonies, Turmoil, or Prelude). The base card only actually gets swapped out
  // once its replacement clears that extra requirement too - otherwise the base card
  // stays, so a game without (say) the Moon expansion still has a normal Earth-tag Lunar
  // Beam instead of neither version.
  conditionalCardsToRemove: new Map([
    [CardName.LUNAR_BEAM, CardName.LUNAR_BEAM_BETTER_MARS],
    [CardName.LUNA_METROPOLIS, CardName.LUNA_METROPOLIS_BETTER_MARS],
    [CardName.LUNAR_EXPORTS, CardName.LUNAR_EXPORTS_BETTER_MARS],
    [CardName.PRISTAR, CardName.PRISTAR_BETTER_MARS],
    [CardName.EARLY_SETTLEMENT, CardName.EARLY_SETTLEMENT_BETTER_MARS],
    [CardName.SELF_SUFFICIENT_SETTLEMENT, CardName.SELF_SUFFICIENT_SETTLEMENT_BETTER_MARS],
    [CardName.MARTIAN_MEDIA_CENTER, CardName.MARTIAN_MEDIA_CENTER_BETTER_MARS],
  ]),
});
