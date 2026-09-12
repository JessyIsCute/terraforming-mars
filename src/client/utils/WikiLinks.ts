import {GameModule} from '@/common/cards/GameModule';

export const WIKI = 'https://github.com/terraforming-mars/terraforming-mars/wiki';

// Conglomerates isn't part of the upstream project, so its rules page lives on this fork's
// own wiki instead of the shared one above.
export const FORK_WIKI = 'https://github.com/JessyIsCute/terraforming-mars/wiki';

export const RULEBOOK_URLS: Record<GameModule, string> = {
  base: `${WIKI}/Rulebooks`,
  corpera: `${WIKI}/Rulebooks`,
  venus: `${WIKI}/Rulebooks`,
  prelude: `${WIKI}/Rulebooks`,
  colonies: `${WIKI}/Rulebooks`,
  turmoil: `${WIKI}/Rulebooks`,
  promo: `${WIKI}/Variants#promo-cards`,
  prelude2: `${WIKI}/Rulebooks`,
  ares: `${WIKI}/Ares`,
  community: `${WIKI}/Community`,
  moon: `${WIKI}/The-Moon`,
  pathfinders: `${WIKI}/Pathfinders`,
  ceo: `${WIKI}/CEOs`,
  starwars: `${WIKI}/StarWars`,
  underworld: `${WIKI}/Underworld`,
  deltaProject: `${WIKI}/Delta-Project`,
  sillyfication: `${FORK_WIKI}/Sillyfication`,
  betterMars: `${FORK_WIKI}/BetterMars`,
  customCards: `${WIKI}/Community`,
  mutationMarkets: `${FORK_WIKI}/MutationMarkets`,
  conglomerates: `${FORK_WIKI}/Conglomerates`,
  blackMarket: `${FORK_WIKI}/Black-Market`,
  corporateBetterments: `${FORK_WIKI}/Corporate-Betterments`,
  idesOfMars: `${FORK_WIKI}/Ides-of-Mars`,
  robAntilles: `${FORK_WIKI}/Rob-Antilles`,
};

export const WIKI_URLS = {
  changelog: `${WIKI}/Changelog`,
  aresExtreme: `${WIKI}/Ares-Extreme`,
  alternativeVenusBoard: `${WIKI}/Alternative-Venus-Board`,
  moonStandardProjectVariant: `${WIKI}/Variants#moon-standard-project-variant`,
  escapeVelocity: `${WIKI}/Escape-Velocity`,
  worldGovernmentTerraforming: `${WIKI}/Variants#world-government-terraforming`,
  trSoloMode: `${WIKI}/Variants#tr-solo-mode`,
  allowUndo: `${WIKI}/Variants#allow-undo`,
  merger: `${WIKI}/Variants#Merger`,
  randomizeBoardTiles: `${WIKI}/Variants#randomize-board-tiles`,
  setPredefinedGame: `${WIKI}/Variants#set-predefined-game`,
  removeNegativeGlobalEvents: `${WIKI}/Variants#remove-negative-global-events`,
  initialDraft: `${WIKI}/Variants#initial-draft`,
  randomMilestonesAndAwards: `${WIKI}/Variants#random-milestones-and-awards`,
  venusTerraforming: `${WIKI}/Variants#venus-terraforming`,
  showRealtimeVP: `${WIKI}/Variants#show-real-time-vp`,
  fastMode: `${WIKI}/Variants#fast-mode`,
  beginnerCorporation: `${WIKI}/Variants#beginner-corporation`,
  trBoost: `${WIKI}/Variants#tr-boost`,
} as const;
