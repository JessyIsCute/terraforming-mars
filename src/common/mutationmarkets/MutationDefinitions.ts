import {MutationName} from './MutationName';
import {MutationDefinition} from './MutationDefinition';
import {Tag} from '../cards/Tag';

/**
 * The mutation card manifest. Seven mutations are authored with real specs and a real
 * ongoing card effect: TAG_DIVERSIFIER ("Diverse"), GIGANTIC_UNDERTAKINGS ("Gigantic"),
 * MINI_MUTATION ("Mini"), CITY_PLANNER ("Planned"), HEAT_BANKER ("Thermal"),
 * SCIENCE_PATRON ("Sponsored"), and NESTED_MUTATION ("Nested"). The rest are still Phase 1
 * placeholders (`effect: {kind: 'none'}`) exercising the data shape, pending real specs.
 */
export const MUTATION_DEFINITIONS: Record<MutationName, MutationDefinition> = {
  [MutationName.TAG_DIVERSIFIER]: {
    name: MutationName.TAG_DIVERSIFIER,
    prefix: 'Diverse',
    requirement: {uniqueTags: 5},
    reward: {tr: 1},
    minimumBid: 1,
    steps: 1,
    effect: {kind: 'addRandomTag'},
  },
  [MutationName.GIGANTIC_UNDERTAKINGS]: {
    name: MutationName.GIGANTIC_UNDERTAKINGS,
    prefix: 'Gigantic',
    // 2+ cards costing 25 M€ or more played, including events.
    requirement: {expensiveCardsPlayed: 2},
    reward: {victoryPoints: 1},
    minimumBid: 2,
    steps: 2,
    // Cost +50% (clamped to +3..+12), and +1 VP for every 3 M€ of that increase.
    effect: {kind: 'costPercent', percent: 50, minAbsDelta: 3, maxAbsDelta: 12, vpPerAbsDelta: 3},
  },
  [MutationName.MINI_MUTATION]: {
    name: MutationName.MINI_MUTATION,
    prefix: 'Mini',
    // 7+ cards costing less than 7 M€ played, including events.
    requirement: {cheapCardsPlayed: 7},
    reward: {cards: 1},
    minimumBid: 1,
    steps: 1,
    // Cost -30% (clamped to -3..-12).
    effect: {kind: 'costPercent', percent: -30, minAbsDelta: 3, maxAbsDelta: 12},
  },
  [MutationName.CITY_PLANNER]: {
    name: MutationName.CITY_PLANNER,
    prefix: 'Planned',
    requirement: {cities: 3},
    reward: {megacredits: 6},
    minimumBid: 2,
    steps: 1,
    // Cost -25% (clamped to -2..-8): a well-planned city build comes in under budget.
    effect: {kind: 'costPercent', percent: -25, minAbsDelta: 2, maxAbsDelta: 8},
  },
  [MutationName.GREENERY_KEEPER]: {
    name: MutationName.GREENERY_KEEPER,
    prefix: 'Verdant',
    requirement: {greeneries: 2},
    reward: {tr: 1},
    minimumBid: 1,
    steps: 2,
    effect: {kind: 'none'},
  },
  [MutationName.OCEAN_SURVEYOR]: {
    name: MutationName.OCEAN_SURVEYOR,
    prefix: 'Tidal',
    requirement: {oceans: 4},
    reward: {cards: 2},
    minimumBid: 1,
    steps: 1,
    effect: {kind: 'none'},
  },
  [MutationName.HEAT_BANKER]: {
    name: MutationName.HEAT_BANKER,
    prefix: 'Thermal',
    requirement: {tag: Tag.POWER, count: 3},
    reward: {megacredits: 4},
    minimumBid: 1,
    steps: 2,
    // Cost +25% (clamped to +2..+8), and +1 VP for every 4 M€ of that increase: a
    // thermal asset that appreciates in value.
    effect: {kind: 'costPercent', percent: 25, minAbsDelta: 2, maxAbsDelta: 8, vpPerAbsDelta: 4},
  },
  [MutationName.STEEL_BARON]: {
    name: MutationName.STEEL_BARON,
    prefix: 'Reinforced',
    requirement: {tag: Tag.BUILDING, count: 4},
    reward: {tr: 1},
    minimumBid: 2,
    steps: 1,
    effect: {kind: 'none'},
  },
  [MutationName.SCIENCE_PATRON]: {
    name: MutationName.SCIENCE_PATRON,
    prefix: 'Sponsored',
    requirement: {tag: Tag.SCIENCE, count: 3},
    reward: {cards: 1},
    minimumBid: 1,
    steps: 1,
    // A research patron funds a second line of inquiry: adds one random tag the card
    // doesn't already have (same mechanic as Tag Diversifier, different requirement).
    effect: {kind: 'addRandomTag'},
  },
  [MutationName.ANIMAL_WARDEN]: {
    name: MutationName.ANIMAL_WARDEN,
    prefix: 'Sheltered',
    requirement: {tag: Tag.ANIMAL, count: 2},
    reward: {megacredits: 3},
    minimumBid: 1,
    steps: 2,
    effect: {kind: 'none'},
  },
  [MutationName.BUILDING_MOGUL]: {
    name: MutationName.BUILDING_MOGUL,
    prefix: 'Monumental',
    requirement: {tag: Tag.BUILDING, count: 6},
    reward: {tr: 2},
    minimumBid: 2,
    steps: 1,
    effect: {kind: 'none'},
  },
  [MutationName.SPACE_VISIONARY]: {
    name: MutationName.SPACE_VISIONARY,
    prefix: 'Orbital',
    requirement: {tag: Tag.SPACE, count: 4},
    reward: {megacredits: 5},
    minimumBid: 1,
    steps: 2,
    effect: {kind: 'none'},
  },
  [MutationName.NESTED_MUTATION]: {
    name: MutationName.NESTED_MUTATION,
    prefix: 'Nested',
    // 3 cards (including events) played this generation, each cheaper than the last.
    requirement: {cardCostStreak: 3},
    reward: {tr: 1},
    minimumBid: 2,
    steps: 2,
    // Doesn't touch this card's own cost/tags/VP; the first time it's *played*, the
    // player receives a fresh, separately-discounted copy of it instead (-40%, clamped
    // -3..-12) -- see MutationEffects.nestedCopyDelta / Player.playCard.
    effect: {kind: 'nestedCopy', percent: -40, minAbsDelta: 3, maxAbsDelta: 12},
  },
};
