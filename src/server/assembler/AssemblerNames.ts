import {EffectCategory} from '../../common/assembler/EffectCategory';
import {AssemblerComplexity} from './AssembleSpec';

/**
 * Assembler (fan): card names built from what the card does.
 *
 * Each effect category has words in two tiers. A part worth MAJOR_VALUE M€ or more (or that much
 * of a drawback) uses the major words: a small heat gain makes a "Heater", a big one a "Furnace
 * Array"; a small heat loss is "Cooled", a big one "Frozen".
 *
 * The strongest benefit gives the noun. The next category gives an adjective in front ("Cooled
 * Reactor"). High-complexity cards add a third category as an ending ("Cooled Reactor of Bloom").
 */
type Words = {
  nouns: [ReadonlyArray<string>, ReadonlyArray<string>],
  adjectives: [ReadonlyArray<string>, ReadonlyArray<string>],
  /** "of ..." endings for high-complexity cards. */
  endings: ReadonlyArray<string>,
};

export const MAJOR_VALUE = 10;

export const CATEGORY_WORDS: Record<EffectCategory, Words> = {
  heat: {
    nouns: [['Heater', 'Thermal Vent', 'Heat Sink'], ['Solar Lens', 'Magma Tap', 'Furnace Array']],
    adjectives: [['Heated', 'Warm'], ['Scorching', 'Blazing']],
    endings: ['of Embers', 'of the Sun'],
  },
  cooling: {
    nouns: [['Cryo Vent', 'Heat Siphon', 'Coolant Loop'], ['Cryo Plant', 'Glacier Engine']],
    adjectives: [['Cooled', 'Chilled'], ['Frozen', 'Glacial']],
    endings: ['of Frost', 'of the Long Night'],
  },
  plants: {
    nouns: [['Greenhouse', 'Lichen Farm', 'Seed Bank'], ['Bio-Dome', 'Forest Ark']],
    adjectives: [['Verdant', 'Green'], ['Overgrown', 'Lush']],
    endings: ['of Bloom', 'of the Wilds'],
  },
  blight: {
    nouns: [['Weed Burner', 'Defoliator'], ['Blight Engine', 'Crop Razer']],
    adjectives: [['Withered', 'Pruned'], ['Blighted', 'Barren']],
    endings: ['of Ash', 'of Rot'],
  },
  energy: {
    nouns: [['Power Cell', 'Generator', 'Reactor'], ['Fusion Core', 'Power Grid']],
    adjectives: [['Charged', 'Powered'], ['Overcharged', 'Fusion']],
    endings: ['of Sparks', 'of Lightning'],
  },
  drain: {
    nouns: [['Power Sink', 'Capacitor'], ['Energy Siphon', 'Grid Leech']],
    adjectives: [['Drained', 'Hungry'], ['Depleted', 'Power-starved']],
    endings: ['of Static', 'of Brownouts'],
  },
  metal: {
    nouns: [['Foundry', 'Ore Smelter', 'Mine'], ['Mass Driver', 'Titan Forge']],
    adjectives: [['Forged', 'Riveted'], ['Hardened', 'Titanium']],
    endings: ['of Iron', 'of the Deep Vein'],
  },
  money: {
    nouns: [['Exchange', 'Trade Office', 'Market'], ['Holding', 'Investment Bank']],
    adjectives: [['Funded', 'Profitable'], ['Lucrative', 'Gilded']],
    endings: ['of Fortune', 'of Plenty'],
  },
  debt: {
    nouns: [['Loan Office', 'Toll Gate'], ['Debt Engine', 'Tax Bureau']],
    adjectives: [['Indebted', 'Taxed'], ['Bankrupt', 'Overpriced']],
    endings: ['of Debt', 'of Red Ink'],
  },
  water: {
    nouns: [['Aquifer', 'Ice Melter', 'Pump Station'], ['Hydro Basin', 'Ocean Maker']],
    adjectives: [['Wet', 'Flooded'], ['Tidal', 'Deluge']],
    endings: ['of the Deep', 'of Tides'],
  },
  air: {
    nouns: [['Air Scrubber', 'Cloud Seeder', 'Atmo Shaper'], ['Air Forge', 'Sky Engine']],
    adjectives: [['Aerated', 'Breezy'], ['Stormborn', 'Skyward']],
    endings: ['of the Winds', 'of Clouds'],
  },
  knowledge: {
    nouns: [['Archive', 'Data Relay', 'Lab'], ['Think Tank', 'Grand Library']],
    adjectives: [['Curious', 'Studied'], ['Brilliant', 'Genius']],
    endings: ['of Insight', 'of Secrets'],
  },
  city: {
    nouns: [['Habitat', 'Outpost', 'Settlement'], ['Metropolis', 'Arcology']],
    adjectives: [['Urban', 'Civic'], ['Metropolitan', 'Grand']],
    endings: ['of Many', 'of the Colonists'],
  },
  prestige: {
    nouns: [['Monument', 'Landmark', 'Plaque'], ['Wonder', 'Legacy']],
    adjectives: [['Renowned', 'Noted'], ['Legendary', 'Famed']],
    endings: ['of Glory', 'of Ages'],
  },
  infamy: {
    nouns: [['Eyesore', 'Scrapheap'], ['Folly', 'Blunder']],
    adjectives: [['Shoddy', 'Disreputable'], ['Disgraced', 'Infamous']],
    endings: ['of Shame', 'of Scandal'],
  },
  efficiency: {
    nouns: [['Workshop', 'Assembly Bay'], ['Factory', 'Fabricator']],
    adjectives: [['Streamlined', 'Efficient'], ['Optimized', 'Automated']],
    endings: ['of Thrift', 'of Savings'],
  },
  synergy: {
    nouns: [['Relay', 'Feedback Loop'], ['Resonator', 'Nexus']],
    adjectives: [['Linked', 'Tuned'], ['Resonant', 'Harmonic']],
    endings: ['of Echoes', 'of Harmony'],
  },
};

/** What the namer needs to know about each part of the card. */
export type NamedPart = {
  category: EffectCategory,
  value: number,
  /** A drawback of the card (a bad part). */
  bad: boolean,
};

/** Longer titles shrink on the card face; past this the ending is dropped. */
export const MAX_TITLE_LENGTH = 30;

function tier(value: number): 0 | 1 {
  return Math.abs(value) >= MAJOR_VALUE ? 1 : 0;
}

/**
 * The card's title from its parts.
 * @param pick chooses one word from a list (the generator's seeded random pick).
 */
export function nameCard(parts: ReadonlyArray<NamedPart>, complexity: AssemblerComplexity, pick: <T>(items: ReadonlyArray<T>) => T): string {
  const benefits = parts.filter((p) => !p.bad && p.value > 0).sort((a, b) => b.value - a.value);
  const main = benefits[0] ?? parts[0];
  const noun = pick(CATEGORY_WORDS[main.category].nouns[tier(main.value)]);

  // Other categories, strongest first. A drawback names the card before a second benefit does,
  // so a heat-removing card reads "Cooled ...", which tells you what the card costs you.
  const others: Array<NamedPart> = [];
  const seen = new Set<EffectCategory>([main.category]);
  const rest = parts.filter((p) => p !== main).sort((a, b) => (Number(b.bad) - Number(a.bad)) || (Math.abs(b.value) - Math.abs(a.value)));
  for (const p of rest) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      others.push(p);
    }
  }

  // With only one category, the adjective comes from it too ("Lush Bio-Dome").
  const first = others[0] ?? main;
  const adjectives = CATEGORY_WORDS[first.category].adjectives[tier(first.value)];
  // Avoid "Heated Heater": skip an adjective that starts like the noun.
  const fitting = adjectives.filter((a) => a.slice(0, 4) !== noun.slice(0, 4));
  const adjective = pick(fitting.length > 0 ? fitting : adjectives);
  let title = `${adjective} ${noun}`;
  if (complexity === 'high') {
    const second = others[1];
    const ending = second !== undefined ? pick(CATEGORY_WORDS[second.category].endings) : 'Mk II';
    const longer = `${title} ${ending}`;
    if (longer.length <= MAX_TITLE_LENGTH) {
      title = longer;
    }
  }
  return title;
}
