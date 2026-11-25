import {Tag} from '../../common/cards/Tag';
import {AssemblerValueTableModel, RateableValue, ValueTableSection} from '../../common/assembler/AssemblerValueTable';
import {EFFECT_CATEGORIES, EFFECT_CATEGORY_INFO} from '../../common/assembler/EffectCategory';
import {ASSEMBLER_CARD_MANIFEST} from '../cards/assembler/AssemblerCardManifest';
import {CardName} from '../../common/cards/CardName';
import {IProjectCard} from '../cards/IProjectCard';
import {OPEN_SOURCE_BLUEPRINTS_DISCOUNT, OPEN_SOURCE_BLUEPRINTS_PRESET} from '../cards/assembler/OpenSourceBlueprints';
import * as V from './AssemblerValues';
import {COMPLEXITY_WEIGHTS, profileOf} from './AssemblerGenerator';
import {CATEGORY_WORDS, MAJOR_VALUE, ENDING_FROM} from './AssemblerNames';
import {AssembleSpec} from './AssembleSpec';

/** "8.5", "11", "−2.5": one decimal at most, a real minus sign. */
function num(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded < 0 ? `−${Math.abs(rounded)}` : String(rounded);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function range([lo, hi]: [number, number]): string {
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}

function section(title: string, columns: Array<string>, numeric: Array<boolean>, rows: Array<Array<string>>, intro?: string): ValueTableSection {
  return intro === undefined ? {title, columns, numeric, rows} : {title, intro, columns, numeric, rows};
}

const RESOURCE_LABEL: Record<V.StandardResource, string> = {
  megacredits: 'M€',
  steel: 'Steel',
  titanium: 'Titanium',
  plants: 'Plants',
  energy: 'Energy',
  heat: 'Heat',
};

const TAG_ORDER: Array<Tag> = [Tag.BUILDING, Tag.SPACE, Tag.EARTH, Tag.SCIENCE, Tag.VENUS, Tag.PLANT, Tag.POWER, Tag.MICROBE, Tag.JOVIAN, Tag.CITY, Tag.ANIMAL, Tag.WILD];

/** The preset each printed Assembler card uses, in words. */
export function describeSpec(spec: AssembleSpec): string {
  const parts: Array<string> = [];
  const lo = spec.minComplexity;
  const hi = spec.maxComplexity;
  if (lo !== undefined && hi !== undefined) {
    parts.push(lo === hi ? `complexity ${lo}` : `complexity ${lo}–${hi}`);
  } else if (lo !== undefined) {
    parts.push(`complexity ${lo} or more`);
  } else if (hi !== undefined) {
    parts.push(hi === 1 ? 'complexity 1' : `complexity ${hi} or less`);
  }
  if (spec.tags !== undefined && spec.tags.length > 0) {
    parts.push(`at least 1 ${spec.tags.join(' and ')} tag`);
  }
  if (spec.tagCount !== undefined) {
    parts.push(`exactly ${spec.tagCount} tags`);
  }
  if (spec.minCost !== undefined && spec.maxCost !== undefined) {
    parts.push(`cost ${spec.minCost}–${spec.maxCost} M€`);
  } else if (spec.maxCost !== undefined) {
    parts.push(`cost at most ${spec.maxCost} M€`);
  } else if (spec.minCost !== undefined) {
    parts.push(`cost at least ${spec.minCost} M€`);
  }
  if (spec.costAdjust !== undefined) {
    parts.push(`then ${num(spec.costAdjust)} M€`);
  }
  if (spec.forceRequirement === true) {
    parts.push('with a requirement');
  }
  if (spec.categories !== undefined && spec.categories.length > 0) {
    parts.push(`with ${spec.categories.map((c) => EFFECT_CATEGORY_INFO[c].label).join(', ')}`);
  }
  const text = parts.join(', ');
  return text === '' ? 'Random' : text.charAt(0).toUpperCase() + text.slice(1);
}

const PRESETS: Partial<Record<CardName, string>> = {
  [CardName.RESEARCH_PROTOTYPE]: describeSpec({tags: [Tag.SCIENCE]}),
  [CardName.OPEN_SOURCE_BLUEPRINTS]: `${describeSpec(OPEN_SOURCE_BLUEPRINTS_PRESET)}; yours ${num(-OPEN_SOURCE_BLUEPRINTS_DISCOUNT)} M€`,
  [CardName.QUAD_CORE_CHASSIS]: describeSpec({tagCount: 4}),
  [CardName.SPECIALIZED_FABRICATOR]: 'Has your most common tag',
  [CardName.VENTURE_PROTOTYPE]: describeSpec({minComplexity: 5}),
  [CardName.BARGAIN_BIN]: describeSpec({maxComplexity: 1, maxCost: 8}),
};

/** Effect and action texts live in the card's picture, not its description; spelled out here. */
const EFFECTS: Partial<Record<CardName, string>> = {
  [CardName.ASSEMBLY_LINE]: 'Action: spend 1 M€ to Assemble a new card into your hand.',
  [CardName.SALVAGE_YARD]: 'Effect: when you play an assembled card, gain 2 M€.',
  [CardName.ASSEMBLY_ROBOTS]: 'Effect: assembled cards cost you 2 M€ less.',
  [CardName.REVERSE_ENGINEERING]: 'Action: discard a card to Assemble a new card into your hand.',
  [CardName.HALL_OF_PROTOTYPES]: '1 VP for every 2 assembled cards you have played.',
};

/** Everything on the value table page. */
export function buildValueTable(): AssemblerValueTableModel {
  const sections: Array<ValueTableSection> = [];

  sections.push(section('How a card is priced', ['Rule', 'Value'], [false, false], [
    ['Card value', 'Sum of its parts, tags and requirement (in M€)'],
    ['Printed cost', `Value − ${V.BUY_COST} (what it costs to buy the card), rounded`],
    ['Cost range', `${V.MIN_COST}–${V.MAX_COST} M€; cards outside it are rerolled`],
    ['Big effect', `Worth ${MAJOR_VALUE} M€ or more: uses the stronger naming words`],
  ], 'Every assembled card is worth what its parts are worth. A drawback has a negative value and makes the card cheaper.'));

  sections.push(section('Resources', ['Resource', '1 in stock', '1 production step', 'Category'], [false, true, true, false],
    (Object.keys(V.STOCK_VALUE) as Array<V.StandardResource>).map((r) => [
      RESOURCE_LABEL[r],
      num(V.STOCK_VALUE[r]),
      num(V.PRODUCTION_VALUE[r]),
      EFFECT_CATEGORY_INFO[r === 'megacredits' ? 'money' : r === 'steel' || r === 'titanium' ? 'metal' : r].label,
    ]),
    'Losing a resource or production is worth the same, negative.'));

  sections.push(section('One-off effects', ['Effect', 'Value', 'Category'], [false, true, false], [
    ['Raise your TR 1 step', num(V.TR_VALUE), 'Prestige'],
    ['1 victory point', num(V.VP_VALUE), 'Prestige'],
    ['Draw a card', num(V.DRAW_CARD_VALUE), 'Knowledge'],
    ['Raise temperature 1 step', num(V.GLOBAL_STEP_VALUE.temperature), 'Heat'],
    ['Raise oxygen 1 step', num(V.GLOBAL_STEP_VALUE.oxygen), 'Air'],
    ['Raise Venus 1 step', num(V.GLOBAL_STEP_VALUE.venus), 'Air'],
    ['Place an ocean tile', num(V.OCEAN_VALUE), 'Water'],
    ['Place a greenery tile (and raise oxygen)', num(V.GREENERY_VALUE), 'Plants'],
    ['Place a city tile', num(V.CITY_VALUE), 'City'],
    ['Remove 1 plant from any player', num(V.REMOVE_PLANT_VALUE), 'Blight'],
    ['Decrease any production 1 step', `${pct(V.DECREASE_ANY_FACTOR)} of the step's value (M€ ${num(V.DECREASE_ANY_FACTOR * V.PRODUCTION_VALUE.megacredits)}, titanium ${num(V.DECREASE_ANY_FACTOR * V.PRODUCTION_VALUE.titanium)})`, 'Cooling / Blight / Debt / Drain / Rust'],
    ['Steal 1 resource from another player', `${num(V.STEAL_FACTOR)} × its stock value`, 'Theft'],
    ['Discard a card from your hand', num(-V.DISCARD_VALUE), 'Forgetting'],
    ['Each opponent chooses a card to discard', num(V.OPPONENT_DISCARD_VALUE), 'Espionage'],
    ['An opponent of your choice chooses a card to discard', num(V.TARGET_DISCARD_VALUE), 'Espionage'],
    ['Add 1 animal to another card', num(V.CARD_RESOURCE_VALUE.animal), 'Fauna'],
    ['Add 1 microbe to another card', num(V.CARD_RESOURCE_VALUE.microbe), 'Microbes'],
    ['Add 1 floater to another card', num(V.CARD_RESOURCE_VALUE.floater), 'Floaters'],
  ]));

  sections.push(section('Effects and actions', ['What', 'How it\'s valued', 'Example'], [false, false, false], [
    ['Action: gain resources', `What you gain × ${V.ACTION_USES} uses`, `Gain 1 steel: ${num(V.STOCK_VALUE.steel)} × ${V.ACTION_USES} = ${num(V.STOCK_VALUE.steel * V.ACTION_USES)}`],
    ['Action: spend energy to gain', `(Gain − energy spent) × ${V.ACTION_USES} uses`,
      `2 energy → 2 steel: (${num(2 * V.STOCK_VALUE.steel)} − ${num(2 * V.STOCK_VALUE.energy)}) × ${V.ACTION_USES} = ${num((2 * V.STOCK_VALUE.steel - 2 * V.STOCK_VALUE.energy) * V.ACTION_USES)}`],
    ['Action: spend 4 energy to raise a parameter', `(Step − 4 energy) × ${V.CONVERSION_ACTION_USES} uses`,
      `Temperature: (${num(V.GLOBAL_STEP_VALUE.temperature)} − ${num(4 * V.STOCK_VALUE.energy)}) × ${V.CONVERSION_ACTION_USES} = ${num((V.GLOBAL_STEP_VALUE.temperature - 4 * V.STOCK_VALUE.energy) * V.CONVERSION_ACTION_USES)}`],
    ['Discount on every card', `${num(V.ALL_DISCOUNT_VALUE)} per M€ (the ~${V.CARDS_PLAYED_AFTER} cards played after, plus playing big cards sooner)`, `1 M€: ${num(V.ALL_DISCOUNT_VALUE)}`],
    ['Discount on a tag', `Discount × ${V.CARDS_PLAYED_AFTER} × tag share × focus (0.45 ÷ share, 1.5 to 4: rarer tags pull harder)`,
      `2 M€ on science: ${num(V.tagDiscountValue(Tag.SCIENCE, 2))}, space: ${num(V.tagDiscountValue(Tag.SPACE, 2))}, jovian: ${num(V.tagDiscountValue(Tag.JOVIAN, 2))}`],
    ['When you play a tag, gain', `Gain × ${V.CARDS_PLAYED_AFTER} × tag share × ${V.FOCUS_FACTOR}`,
      `2 M€ per space tag: 2 × ${V.CARDS_PLAYED_AFTER} × ${pct(V.TAG_SHARE[Tag.SPACE] ?? 0)} × ${V.FOCUS_FACTOR} = ${num(2 * V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[Tag.SPACE] ?? 0) * V.FOCUS_FACTOR)}`],
    ['When you play a tag, draw a card', `${num(V.DRAW_CARD_VALUE)} × ${V.CARDS_PLAYED_AFTER} × tag share × ${V.FOCUS_FACTOR}`,
      `Science: ${num(V.DRAW_CARD_VALUE * V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[Tag.SCIENCE] ?? 0) * V.FOCUS_FACTOR)}`],
    ['Action: add 1 animal / microbe / floater here', `${num(V.VP_VALUE)} ÷ resources per VP × ${V.COLLECTOR_USES} uses`,
      `1 VP per 2 animals: ${num(V.VP_VALUE / 2 * V.COLLECTOR_USES)}`],
    ['When you play a tag, add 1 resource here', `${num(V.VP_VALUE)} ÷ resources per VP × ${V.CARDS_PLAYED_AFTER} × tag share × ${V.FOCUS_FACTOR}`,
      `Microbe per plant tag, 1 VP per 3: ${num(V.VP_VALUE / 3 * V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[Tag.PLANT] ?? 0) * V.FOCUS_FACTOR)}`],
    ['Production per X tags (Growth)', `Step value ÷ X × ${V.TAGS_IN_PLAY} cards in play × tag share (+1 tag if the card has it)`,
      `1 M€ per 2 building tags: ${num(V.PRODUCTION_VALUE.megacredits / 2 * V.TAGS_IN_PLAY * (V.TAG_SHARE[Tag.BUILDING] ?? 0))}`],
    ['Cards cost 1 M€ more (drawback)', `−${num(V.ALL_DISCOUNT_VALUE)} for every card; −${V.CARDS_PLAYED_AFTER} × tag share for one tag`, `Science tags: ${num(-V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[Tag.SCIENCE] ?? 0))}`],
  ]));

  sections.push(section('Tags', ['Tag', 'Value', 'Share of cards', '2 M€ off it'], [false, true, true, true],
    TAG_ORDER.map((t) => [
      t.charAt(0).toUpperCase() + t.slice(1),
      num(V.TAG_VALUE[t] ?? 0),
      V.TAG_SHARE[t] !== undefined ? pct(V.TAG_SHARE[t]) : '–',
      V.TAG_SHARE[t] !== undefined ? num(V.tagDiscountValue(t, 2)) : '–',
    ]),
    `The most valuable tag counts fully, every other tag ${pct(V.EXTRA_TAG_FACTOR)}. An event's tags count ${pct(V.EVENT_TAG_FACTOR)}, plus ${num(V.EVENT_TAG_VALUE)} for the event tag. ` +
    'Paying with steel or titanium is not priced on top: that is already why steel and titanium are worth 2 and 3 M€. ' +
    'A card has the city tag exactly when it places a city.'));

  const tagRequirementRows = [1, 2, 3, 4, 5].map((n) => [`${n} tag${n === 1 ? '' : 's'}`, num(-Math.pow(n, V.TAG_REQUIREMENT_EXPONENT))]);
  sections.push(section('Requirements', ['Requirement', 'Value'], [false, true], [
    ['Parameter at least X', `${num(V.GLOBAL_MIN_REQUIREMENT)} × how late (0 = start, 1 = max)`],
    ['Example: 5% oxygen or more', num(V.GLOBAL_MIN_REQUIREMENT * 5 / 14)],
    ['Parameter at most X', `${num(V.GLOBAL_MAX_REQUIREMENT)} × how early it closes`],
    ...tagRequirementRows,
  ], 'A requirement makes a card harder to play, so it lowers the value. Tag requirements grow faster than the count.'));

  const weightTotal = COMPLEXITY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  sections.push(section('Complexity', ['Complexity', 'How often', 'Effect chance', 'Drawbacks', 'Tags', 'Requirement chance', 'Bold chance'], [true, true, true, true, true, true, true],
    COMPLEXITY_WEIGHTS.map(([c, w]) => {
      const p = profileOf(c);
      return [String(c), pct(w / weightTotal), pct(p.effectChance), range(p.bad), range(p.tags), pct(p.requirementChance), pct(p.boldChance)];
    }),
    'A card\'s complexity is 1 per benefit, effect or action, drawback and requirement, plus 1 per tag after the first. The generator picks a complexity (from the asked range, or by "How often") and builds the card to match: tags and the requirement first, then a bold pair (one big benefit, up to 2-3 times the usual amount, paid for by one big drawback), an effect and drawbacks if they fit, and benefits for the rest. A preset that forces something (guaranteed effects, tags, a minimum cost) can make a card busier than asked for.'));

  sections.push(section('Effect categories and names', ['Category', 'Kind', 'What counts', 'Nouns', 'Adjectives (small / big)', 'Endings'], [false, false, false, false, false, false],
    EFFECT_CATEGORIES.map((c) => {
      const info = EFFECT_CATEGORY_INFO[c];
      const w = CATEGORY_WORDS[c];
      return [
        info.label,
        info.bane ? 'Drawback' : 'Benefit',
        info.description,
        [...w.nouns[0], ...w.nouns[1]].join(', '),
        `${w.adjectives[0].join(', ')} / ${w.adjectives[1].join(', ')}`,
        w.endings.join(', '),
      ];
    }),
    `The strongest benefit names the thing, the next effect (a drawback first) describes it, and cards of complexity ${ENDING_FROM} or more add an ending: "Cooled Reactor of Insight".`));

  const printed: Array<IProjectCard> = Object.values(ASSEMBLER_CARD_MANIFEST.projectCards).map((spec) => new spec.Factory());
  sections.push(section('Printed Assembler cards and their presets', ['Card', 'Cost', 'What it does', 'Preset'], [false, true, false, false],
    printed.map((card) => {
      const description = card.metadata.description;
      const text = typeof description === 'string' ? description : description?.text ?? '';
      return [
        card.name,
        String(card.cost),
        [EFFECTS[card.name], text].filter((t) => t !== undefined && t !== '').join(' '),
        PRESETS[card.name] ?? 'Random',
      ];
    })));

  const example = V.PRODUCTION_VALUE.plants + (V.TAG_VALUE[Tag.PLANT] ?? 0);
  sections.push(section('Worked example', ['Part', 'Value'], [false, true], [
    ['Increase your plant production 1 step', num(V.PRODUCTION_VALUE.plants)],
    ['Plant tag', num(V.TAG_VALUE[Tag.PLANT] ?? 0)],
    ['Card value', num(example)],
    [`Printed cost (value − ${V.BUY_COST})`, String(Math.round(example - V.BUY_COST))],
  ]));

  return {sections, rateable: rateableValues()};
}

const RESOURCE_WORD: Record<V.StandardResource, string> = {megacredits: 'M€', steel: 'steel', titanium: 'titanium', plants: 'plant', heat: 'heat', energy: 'energy'};

/** The table's single numbers, for the rating mode's "Rate values". */
export function rateableValues(): Array<RateableValue> {
  const round = (n: number) => Math.round(n * 10) / 10;
  const values: Array<RateableValue> = [];
  const add = (key: string, label: string, value: number, group: string) => values.push({key, label, value: round(value), group});
  for (const r of Object.keys(V.STOCK_VALUE) as Array<V.StandardResource>) {
    if (r !== 'megacredits') {
      add(`stock.${r}`, `Gain 1 ${RESOURCE_WORD[r]}`, V.STOCK_VALUE[r], 'Resources');
    }
  }
  for (const r of Object.keys(V.PRODUCTION_VALUE) as Array<V.StandardResource>) {
    add(`production.${r}`, `Increase your ${RESOURCE_WORD[r]} production 1 step`, V.PRODUCTION_VALUE[r], 'Production');
  }
  add('tr', 'Raise your TR 1 step', V.TR_VALUE, 'One-off effects');
  add('vp', '1 victory point', V.VP_VALUE, 'One-off effects');
  add('draw', 'Draw a card', V.DRAW_CARD_VALUE, 'One-off effects');
  add('global.temperature', 'Raise the temperature 1 step', V.GLOBAL_STEP_VALUE.temperature, 'One-off effects');
  add('global.oxygen', 'Raise oxygen 1 step', V.GLOBAL_STEP_VALUE.oxygen, 'One-off effects');
  add('global.venus', 'Raise Venus 1 step', V.GLOBAL_STEP_VALUE.venus, 'One-off effects');
  add('ocean', 'Place an ocean tile', V.OCEAN_VALUE, 'One-off effects');
  add('greenery', 'Place a greenery tile (and raise oxygen)', V.GREENERY_VALUE, 'One-off effects');
  add('city', 'Place a city tile', V.CITY_VALUE, 'One-off effects');
  add('action.steel', 'Action: gain 1 steel (on a blue card)', V.STOCK_VALUE.steel * V.ACTION_USES, 'Effects and actions');
  add('discount.all', 'Effect: you pay 1 M€ less for every card', V.ALL_DISCOUNT_VALUE, 'Effects and actions');
  add('discount.science', 'Effect: you pay 1 M€ less for science cards', V.tagDiscountValue(Tag.SCIENCE, 1), 'Effects and actions');
  add('discount.space', 'Effect: you pay 1 M€ less for space cards', V.tagDiscountValue(Tag.SPACE, 1), 'Effects and actions');
  for (const t of [Tag.BUILDING, Tag.SPACE, Tag.EARTH, Tag.SCIENCE, Tag.VENUS, Tag.PLANT, Tag.POWER, Tag.MICROBE, Tag.JOVIAN, Tag.CITY, Tag.ANIMAL]) {
    add(`tag.${t}`, `A ${t} tag on a card`, V.TAG_VALUE[t] ?? 0, 'Tags');
  }
  add('event', 'Being an event (the event tag)', V.EVENT_TAG_VALUE, 'Tags');
  for (const n of [1, 2, 3, 4]) {
    add(`req.tags.${n}`, `Requires ${n} science ${n === 1 ? 'tag' : 'tags'} (how much it takes off)`, Math.pow(n, V.TAG_REQUIREMENT_EXPONENT), 'Requirements');
  }
  add('req.oxygen.7', 'Requires 7% oxygen or more (how much it takes off)', -V.GLOBAL_MIN_REQUIREMENT * 7 / 14, 'Requirements');
  return values;
}
