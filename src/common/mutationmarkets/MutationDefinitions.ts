import {MutationName} from './MutationName';
import {MutationDefinition} from './MutationDefinition';
import {Tag} from '../cards/Tag';
import {Resource} from '../Resource';

/**
 * The mutation card manifest. All 12 mutations have a real ongoing card effect --
 * winning an auction gets you the card with that effect applied, nothing more (there's
 * no separate one-time payout).
 */
export const MUTATION_DEFINITIONS: Record<MutationName, MutationDefinition> = {
  [MutationName.TAG_DIVERSIFIER]: {
    name: MutationName.TAG_DIVERSIFIER,
    prefix: 'Diverse',
    requirement: {uniqueTags: 5},
    effect: {kind: 'addRandomTag'},
  },
  [MutationName.GIGANTIC_UNDERTAKINGS]: {
    name: MutationName.GIGANTIC_UNDERTAKINGS,
    prefix: 'Gigantic',
    // 2+ cards costing 25 M€ or more played, including events.
    requirement: {expensiveCardsPlayed: 2},
    // Cost +50% (clamped to +3..+12), and +1 VP for every 3 M€ of that increase.
    effect: {kind: 'costPercent', percent: 50, minAbsDelta: 3, maxAbsDelta: 12, vpPerAbsDelta: 3},
  },
  [MutationName.MINI_MUTATION]: {
    name: MutationName.MINI_MUTATION,
    prefix: 'Mini',
    // 7+ cards costing less than 7 M€ played, including events.
    requirement: {cheapCardsPlayed: 7},
    // Cost -30% (clamped to -3..-12).
    effect: {kind: 'costPercent', percent: -30, minAbsDelta: 3, maxAbsDelta: 12},
  },
  [MutationName.CITY_PLANNER]: {
    name: MutationName.CITY_PLANNER,
    prefix: 'Planned',
    requirement: {cities: 3},
    // Cost -25% (clamped to -2..-8): a well-planned city build comes in under budget.
    effect: {kind: 'costPercent', percent: -25, minAbsDelta: 2, maxAbsDelta: 8},
  },
  [MutationName.GREENERY_KEEPER]: {
    name: MutationName.GREENERY_KEEPER,
    prefix: 'Verdant',
    requirement: {greeneries: 2},
    // A well-tended greenery keeps giving: +2 plants the first time it's played.
    effect: {kind: 'grantResourceOnPlay', resource: Resource.PLANTS, amount: 2},
  },
  [MutationName.OCEAN_SURVEYOR]: {
    name: MutationName.OCEAN_SURVEYOR,
    prefix: 'Tidal',
    requirement: {oceans: 4},
    // Tidal survey work uncovers a geothermal vent: +1 heat production on play.
    effect: {kind: 'grantProductionOnPlay', resource: Resource.HEAT, amount: 1},
  },
  [MutationName.HEAT_BANKER]: {
    name: MutationName.HEAT_BANKER,
    prefix: 'Thermal',
    requirement: {tag: Tag.POWER, count: 3},
    // On-theme: grants the same tag its requirement is built on.
    effect: {kind: 'addSpecificTag', tag: Tag.POWER},
  },
  [MutationName.STEEL_BARON]: {
    name: MutationName.STEEL_BARON,
    prefix: 'Reinforced',
    requirement: {tag: Tag.BUILDING, count: 4},
    // On-theme: grants the same tag its requirement is built on.
    effect: {kind: 'addSpecificTag', tag: Tag.BUILDING},
  },
  [MutationName.SCIENCE_PATRON]: {
    name: MutationName.SCIENCE_PATRON,
    prefix: 'Sponsored',
    requirement: {tag: Tag.SCIENCE, count: 3},
    // A research patron funds a second line of inquiry: grants the same tag its
    // requirement is built on (unlike Tag Diversifier's uniqueTags requirement, this one
    // has an obvious specific tag to give instead of picking randomly).
    effect: {kind: 'addSpecificTag', tag: Tag.SCIENCE},
  },
  [MutationName.ANIMAL_WARDEN]: {
    name: MutationName.ANIMAL_WARDEN,
    prefix: 'Sheltered',
    requirement: {tag: Tag.ANIMAL, count: 2},
    // On-theme: grants the same tag its requirement is built on.
    effect: {kind: 'addSpecificTag', tag: Tag.ANIMAL},
  },
  [MutationName.BUILDING_MOGUL]: {
    name: MutationName.BUILDING_MOGUL,
    prefix: 'Monumental',
    requirement: {tag: Tag.BUILDING, count: 6},
    // A project so significant it changes the nature of the work: flips Automated <-> Event.
    // Kept distinct from Steel Baron's addSpecificTag(BUILDING) (same requirement family,
    // different reward) rather than converted to match -- convertType has no other user,
    // and this is the more interesting of the two Building-tag mutations to keep as-is.
    effect: {kind: 'convertType'},
  },
  [MutationName.SPACE_VISIONARY]: {
    name: MutationName.SPACE_VISIONARY,
    prefix: 'Orbital',
    requirement: {tag: Tag.SPACE, count: 4},
    // On-theme: grants the same tag its requirement is built on.
    effect: {kind: 'addSpecificTag', tag: Tag.SPACE},
  },
  [MutationName.NESTED_MUTATION]: {
    name: MutationName.NESTED_MUTATION,
    prefix: 'Nested',
    // 3 cards (including events) played this generation, each cheaper than the last.
    requirement: {cardCostStreak: 3},
    // Doesn't touch this card's own cost/tags/VP; the first time it's *played*, the
    // player receives a fresh, separately-discounted copy of it instead (-40%, clamped
    // -3..-12) -- see MutationEffects.nestedCopyDelta / Player.playCard.
    effect: {kind: 'nestedCopy', percent: -40, minAbsDelta: 3, maxAbsDelta: 12},
  },
};
