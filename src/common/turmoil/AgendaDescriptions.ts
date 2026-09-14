import {PartyName} from './PartyName';
import {BonusId, PolicyId} from './Types';

/**
 * Plain-text descriptions for every bonus/policy id, for client-side reference display
 * (the Help "player aid" page). The authoritative logic lives in the matching
 * `src/server/turmoil/parties/*.ts` Bonus/Policy classes -- these strings are copied from
 * their `description` fields, since the client can't import server-only game logic.
 *
 * Kelvinists' kp01 description is normally dynamic (cheaper with High-Temp
 * Superconductors in play); this shows its base cost, matching the server's own fallback
 * when no player context is available.
 */
export const AGENDA_DESCRIPTIONS: Partial<Record<BonusId | PolicyId, string>> = {
  mb01: 'Gain 1 M€ for each building tag you have',
  mb02: 'Gain 1 M€ for each tile you have ON MARS',
  mp01: 'When you place a tile ON MARS, gain 1 steel',
  mp02: 'When you play a building tag, gain 2 M€',
  mp03: 'Your steel resources are worth 1 M€ extra',
  mp04: 'Spend 4 M€ to draw a Building card (Turmoil Mars First)',

  sb01: 'Gain 1 M€ for each science tag you have',
  sb02: 'Gain 1 M€ for every 3 cards in hand',
  sp01: 'Pay 10 M€ to draw 3 cards (Turmoil Scientists)',
  sp02: 'Your global requirements are +/- 2 steps',
  sp03: 'When you raise a global parameter, draw a card per step raised',
  sp04: 'Cards with Science tag requirements may be played with 1 less Science tag',

  ub01: 'Gain 1 M€ for each Venus, Earth and Jovian tag you have',
  ub02: 'Gain 1 M€ for each Space tag you have',
  up01: 'Your titanium resources are worth 1 M€ extra',
  up02: 'Spend 4 M€ to gain 2 titanium or add 2 floaters to ANY card (Turmoil Unity)',
  up03: 'Spend 4 M€ to draw a Space card (Turmoil Unity)',
  up04: 'Cards with Space tags cost 2 M€ less to play',

  kb01: 'Gain 1 M€ for each heat production you have',
  kb02: 'Gain 1 heat for each heat production you have',
  kp01: 'Pay 10 M€ to increase your energy and heat production 1 step (Turmoil Kelvinists)',
  kp02: 'When you raise temperature, gain 3 M€ per step raised',
  kp03: 'Convert 6 heat into temperature (Turmoil Kelvinists)',
  kp04: 'When you place a tile, gain 2 heat',

  rb01: 'The player(s) with the lowest TR gains 1 TR',
  rb02: 'The player(s) with the highest TR loses 1 TR',
  rp01: 'When you take an action that raises TR, you MUST pay 3 M€ per step raised',
  rp02: 'When you place a tile, pay 3 M€ or as much as possible',
  rp03: 'Pay 4 M€ to reduce a non-maxed global parameter 1 step (do not gain any track bonuses)',
  rp04: 'When you raise a global parameter, decrease your M€ production 1 step per step raised if possible',

  gb01: 'Gain 1 M€ for each Plant, Microbe and Animal tag you have',
  gb02: 'Gain 2 M€ for each greenery tile you have',
  gp01: 'When you place a greenery tile, gain 4 M€',
  gp02: 'When you place a tile, gain 1 plant',
  gp03: 'When you play an animal, plant or microbe tag, gain 2 M€',
  gp04: 'Spend 5 M€ to gain 3 plants or add 2 microbes to ANY card (Turmoil Greens)',

  popb01: 'Gain 1 M€ for every event you have played',
  popb02: 'The player(s) with the most Event cards played gains 1 TR',
  popp01: 'Every time you play a card worth VP (positive or negative), gain or pay twice that many M€',
  popp02: 'Action: spend 5 M€ to return one of your played Event cards to your hand. It may not be a card that placed special tiles',
  popp03: 'Every time you play an Event card, draw 1 card',
  popp04: 'Action: spend 4 M€ to buy the first Event card',

  spob01: 'Gain 1 M€ for every lunar habitat tile you have',
  spob02: 'Gain 1 M€ for every tile you own adjacent to a city and every colony you have',
  spop01: 'Every time you place a city tile, draw 1 card',
  spop02: 'Every time you place a lunar habitat tile, gain 4 M€',
  spop03: 'Action: pay 15 M€ (titanium usable) to place a colony',
  spop04: 'Not implemented in this codebase: pay 5 M€ to place a town tile on Mars; it advances your individual city track and is worth 1 VP (EPIC campaign concepts)',

  empb01: 'Gain 1 M€ for every energy tag and every card with no tag you have',
  empb02: 'Gain 1 M€ for every energy production level you have',
  empp01: 'You may use energy as M€ (2 M€ per energy)',
  empp02: 'Every time you raise or lower your energy production, gain 2 energy',
  empp03: 'You\'re considered having 2 more energy tags',
  empp04: 'Action: choose energy tag, spend 4 M€ to buy the first card with that tag',

  burb01: 'Gain 2 M€ for every delegate you have in a party',
  burb02: 'Gain 2 M€ for every influence you have',
  burp01: 'Action: spend 5 M€ to buy the first Active card',
  burp02: 'At the start of each turn, pay 3 M€ minus the influence you have (or as much as possible)',
  burp03: 'Every time you place a delegate, gain 3 M€',
  burp04: 'Every time you play a card, discard a card. Does not apply to the chairman',

  cenb01: 'Gain 1 M€ for every different tag you have',
  cenb02: 'Gain 2 M€ for every kind of tile you have',
  cenp01: 'Action: pay 1 of each standard resource except M€, gain 15 M€',
  cenp02: 'Action: pay 7 M€ to raise one of your lowest productions 1 step',
  cenp03: 'Every time you play a card with a tag you did not have, gain 4 M€',
  cenp04: 'Action: choose a tag you do not have, spend 4 M€ to buy the first card with that tag',

  trab01: 'Gain 1 M€ for every wild tag and every card with a tag requirement you have',
  trab02: 'Gain 2 M€ for every milestone or award you have claimed',
  trap01: 'You\'re considered having 1 more wild tag',
  trap02: 'Every time you play a standard project, gain 2 M€',
  trap03: 'Action: pay 15 M€ to draw and play a Prelude card',
  trap04: 'Action: spend 10 M€ to draw 1 unused milestone and 1 unused award, swap one in for an unclaimed milestone or unfunded award, then optionally claim/fund it immediately',
};

/**
 * The More Parties expansion's "Political Agendas" rework reuses several existing bonus/policy
 * ids for entirely different content (each party still has exactly 2 bonus slots and 4 policy
 * slots, per the BonusId/PolicyId shape -- the rework just changes what occupies some slots).
 * Only ids whose content actually changed are listed here; everything else falls back to
 * AGENDA_DESCRIPTIONS unchanged. Consumers should look here first whenever a game (or reference
 * view) has the More Parties expansion active. Kept in sync by hand with the real Bonus/Policy
 * `description` fields in `src/server/turmoil/parties/*MoreParties.ts`.
 */
export const MORE_PARTIES_AGENDA_DESCRIPTIONS: Partial<Record<BonusId | PolicyId, string>> = {
  mb01: 'Gain 1 M€ for every building and Mars tag you have',
  mp02: 'Action: pay 22 M€ (steel usable) to place a city tile on Mars',
  mp03: 'When you play a card with a building tag or Mars tag, gain 2 M€',
  mp04: 'Action: choose building tag or Mars tag, spend 4 M€ to buy the first card with that tag',

  sp01: 'All players are considered having 2 more science tags',
  sp03: 'When you raise a Mars global parameter, draw a card and discard a card, per step raised',
  sp04: 'Action: choose science tag, spend 4 M€ to buy the first card with that tag',

  ub02: 'Gain 1 M€ for every Space tag you have and every titanium production level',
  up02: 'Action: pay 10 M€ to gain a trade fleet',
  up03: 'You\'re considered having 2 more Space tags',
  up04: 'Action: choose a planet tag (except Mars) or Space tag, spend 4 M€ to buy the first card with that tag',

  kb02: 'Gain 2 M€ for every step on the temperature track',
  kp01: 'When you raise temperature, gain 3 M€ per step raised',
  kp02: 'Action: lower your heat production 2 steps, gain 1 TR',
  kp03: 'Action: pay 9 M€ to raise your heat production 2 steps',

  rb02: 'The player(s) with the least tiles on Mars gains 1 TR',
  rp02: 'Discard 1 card every time you play a standard project',
  rp03: 'Pay 3 M€ every time you place a tile on Mars',
  rp04: 'When you raise a Mars global parameter, decrease your M€ production 1 step per step raised',

  gp03: 'Every time you play a card with a plant, microbe or animal tag, gain 1 plant resource or place the corresponding resource on that card',
  gp04: 'Action: choose plant tag or animal tag, spend 4 M€ to buy the first card with that tag',
};

export const PARTY_AGENDA_IDS: Record<PartyName, {bonuses: ReadonlyArray<BonusId>; policies: ReadonlyArray<PolicyId>}> = {
  [PartyName.MARS]: {bonuses: ['mb01', 'mb02'], policies: ['mp01', 'mp02', 'mp03', 'mp04']},
  [PartyName.SCIENTISTS]: {bonuses: ['sb01', 'sb02'], policies: ['sp01', 'sp02', 'sp03', 'sp04']},
  [PartyName.UNITY]: {bonuses: ['ub01', 'ub02'], policies: ['up01', 'up02', 'up03', 'up04']},
  [PartyName.KELVINISTS]: {bonuses: ['kb01', 'kb02'], policies: ['kp01', 'kp02', 'kp03', 'kp04']},
  [PartyName.REDS]: {bonuses: ['rb01', 'rb02'], policies: ['rp01', 'rp02', 'rp03', 'rp04']},
  [PartyName.GREENS]: {bonuses: ['gb01', 'gb02'], policies: ['gp01', 'gp02', 'gp03', 'gp04']},
  [PartyName.POPULISTS]: {bonuses: ['popb01', 'popb02'], policies: ['popp01', 'popp02', 'popp03', 'popp04']},
  [PartyName.SPOME]: {bonuses: ['spob01', 'spob02'], policies: ['spop01', 'spop02', 'spop03', 'spop04']},
  [PartyName.EMPOWER]: {bonuses: ['empb01', 'empb02'], policies: ['empp01', 'empp02', 'empp03', 'empp04']},
  [PartyName.BUREAUCRATS]: {bonuses: ['burb01', 'burb02'], policies: ['burp01', 'burp02', 'burp03', 'burp04']},
  [PartyName.CENTRISTS]: {bonuses: ['cenb01', 'cenb02'], policies: ['cenp01', 'cenp02', 'cenp03', 'cenp04']},
  [PartyName.TRANSHUMANISTS]: {bonuses: ['trab01', 'trab02'], policies: ['trap01', 'trap02', 'trap03', 'trap04']},
};
