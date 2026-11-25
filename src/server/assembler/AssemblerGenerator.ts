import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {Resource} from '../../common/Resource';
import {CardRequirementDescriptor} from '../../common/cards/CardRequirementDescriptor';
import {CardDiscount} from '../../common/cards/Types';
import {Random} from '../../common/utils/Random';
import {Behavior} from '../behavior/Behavior';
import {AssembledCardDefinition, AssembledTrigger, AssembledValueLine, AssemblerComplexity} from './AssembledCardDefinition';
import * as V from './AssemblerValues';
import {fitsOnCard} from './AssemblerRender';
import {AssembleSpec} from './AssembleSpec';
import {EffectCategory} from '../../common/assembler/EffectCategory';
import {nameCard} from './AssemblerNames';

/** A card under construction. Parts write into it. */
type Draft = {
  behavior: Behavior;
  action?: Behavior;
  cardDiscount: Array<CardDiscount>;
  trigger?: AssembledTrigger;
  victoryPoints: number;
};

type PartKind = 'good' | 'effect' | 'bad';

type Part = {
  kind: PartKind;
  /** Two parts with the same key can't be on one card (e.g. two production changes of the same resource). */
  key: string;
  text: string;
  value: number;
  /** Makes the card blue. */
  blue?: boolean;
  /** Something that stays in play (production, VP, a city), so the card shouldn't be an event. */
  lasting?: boolean;
  /** A tag this part works with; the card prefers to carry it. */
  hintTag?: Tag;
  /** Shown on the card face as an effect or action, not in the description. */
  effectText?: string;
  /** What kind of effect this is; names the card and lets presets guarantee it. */
  category: EffectCategory;
  /** A "when you play a X tag" trigger: if the card has that tag itself, it fires once more on play. */
  selfTrigger?: {tag: Tag, value: number};
  apply: (d: Draft) => void;
};

/** The category of gaining a resource or its production. */
const GAIN_CATEGORY: Record<V.StandardResource, EffectCategory> = {
  megacredits: 'money',
  steel: 'metal',
  titanium: 'metal',
  plants: 'plants',
  heat: 'heat',
  energy: 'energy',
};

/** The category of losing a resource or its production. */
const LOSS_CATEGORY = {
  megacredits: 'debt',
  energy: 'drain',
  heat: 'cooling',
  plants: 'blight',
} as const satisfies Partial<Record<V.StandardResource, EffectCategory>>;

const GLOBAL_CATEGORY = {temperature: 'heat', oxygen: 'air', venus: 'air'} as const satisfies Record<string, EffectCategory>;

const NAME: Record<V.StandardResource, string> = {
  megacredits: 'M€',
  steel: 'steel',
  titanium: 'titanium',
  plants: 'plant',
  heat: 'heat',
  energy: 'energy',
};

function joinList(items: Array<string>): string {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Merges the per-part production sentences into one, the way printed cards word it:
 * "Decrease your heat production 1 step and increase your plants production 1 step and M€ production 2 steps."
 * Other sentences pass through unchanged, after the production sentence.
 */
export function compactTexts(texts: Array<string>): Array<string> {
  const decrease: Array<string> = [];
  const increase: Array<string> = [];
  const rest: Array<string> = [];
  for (const t of texts) {
    const m = /^(Decrease|Increase) your (.+ production \d+ steps?)\.$/.exec(t);
    if (m === null) {
      rest.push(t);
    } else {
      (m[1] === 'Decrease' ? decrease : increase).push(m[2]);
    }
  }
  const clauses: Array<string> = [];
  if (decrease.length > 0) {
    clauses.push(`decrease your ${joinList(decrease)}`);
  }
  if (increase.length > 0) {
    clauses.push(`increase your ${joinList(increase)}`);
  }
  if (clauses.length === 0) {
    return rest;
  }
  const sentence = clauses.join(' and ') + '.';
  return [sentence.charAt(0).toUpperCase() + sentence.slice(1), ...rest];
}

/**
 * How busy a card is, in slots: every benefit, effect or action, drawback and requirement takes
 * one. Effects, drawbacks and requirements are rolled first; benefits fill the slots that are left.
 */
export const PROFILE: Record<AssemblerComplexity, {slots: [number, number], effectChance: number, bad: [number, number], tags: [number, number], requirementChance: number}> = {
  low: {slots: [1, 1], effectChance: 0, bad: [0, 0], tags: [1, 1], requirementChance: 0},
  mid: {slots: [2, 3], effectChance: 0.3, bad: [0, 1], tags: [1, 2], requirementChance: 0.35},
  high: {slots: [4, 6], effectChance: 1, bad: [1, 2], tags: [2, 3], requirementChance: 0.5},
};

/** The complexity a card's slot count reads as. */
export function complexityOfSlots(slots: number): AssemblerComplexity {
  return slots <= PROFILE.low.slots[1] ? 'low' : slots <= PROFILE.mid.slots[1] ? 'mid' : 'high';
}

const COMPLEXITY_ORDER: ReadonlyArray<AssemblerComplexity> = ['low', 'mid', 'high'];

const TAG_WEIGHTS: Array<[Tag, number]> = [
  [Tag.BUILDING, 31], [Tag.SPACE, 26], [Tag.EARTH, 16], [Tag.SCIENCE, 15], [Tag.VENUS, 11], [Tag.PLANT, 11],
  [Tag.POWER, 11], [Tag.MICROBE, 9], [Tag.JOVIAN, 7], [Tag.CITY, 7], [Tag.ANIMAL, 4], [Tag.WILD, 1.5],
];

const GLOBALS = {
  oxygen: {start: 0, max: 14, step: 1, text: (n: number) => `${n}% oxygen`},
  temperature: {start: -30, max: 8, step: 2, text: (n: number) => `${n} C`},
  oceans: {start: 0, max: 9, step: 1, text: (n: number) => `${n} ocean tiles`},
  venus: {start: 0, max: 30, step: 2, text: (n: number) => `Venus ${n}%`},
} as const;

function an(tag: Tag) {
  return /^[aeiou]/.test(tag) ? `an ${tag}` : `a ${tag}`;
}

/** "1 plant", "3 plants", "2 steel", "5 M€": only plants take a plural, like on printed cards. */
function amount(n: number, r: keyof typeof NAME) {
  return r === 'plants' && n !== 1 ? `${n} plants` : `${n} ${NAME[r]}`;
}

function plural(n: number, word: string) {
  return n === 1 ? `${n} ${word}` : `${n} ${word}s`;
}

/**
 * Builds random cards from the Assembler value table. Deterministic for a given Random state,
 * so a seeded game always assembles the same cards.
 */
export class AssemblerGenerator {
  constructor(private readonly rng: Random) {}

  private int(lo: number, hi: number): number {
    return lo + this.rng.nextInt(hi - lo + 1);
  }
  private chance(p: number): boolean {
    return this.rng.next() < p;
  }
  private pick<T>(items: ReadonlyArray<T>): T {
    return items[this.rng.nextInt(items.length)];
  }
  private weighted<T>(pairs: ReadonlyArray<readonly [T, number]>): T {
    const total = pairs.reduce((s, p) => s + p[1], 0);
    let r = this.rng.next() * total;
    for (const [v, w] of pairs) {
      r -= w;
      if (r < 0) {
        return v;
      }
    }
    return pairs[0][0];
  }

  // ---- parts -------------------------------------------------------------------------------------

  private goodPart(): Part {
    return this.weighted<() => Part>([
      [() => this.gainStock(), 10],
      [() => this.gainProduction(), 10],
      [() => ({kind: 'good', key: 'tr', text: 'Raise your TR 1 step.', value: V.TR_VALUE, category: 'prestige', apply: (d) => d.behavior.tr = 1}), 3],
      [() => this.raiseGlobal(), 4],
      [() => ({kind: 'good', key: 'ocean', text: 'Place an ocean tile.', value: V.OCEAN_VALUE, category: 'water', apply: (d) => d.behavior.ocean = {}}), 2],
      [() => ({kind: 'good', key: 'greenery', text: 'Place a greenery tile and raise oxygen 1 step.', value: V.GREENERY_VALUE, hintTag: Tag.PLANT, category: 'plants', apply: (d) => d.behavior.greenery = {}}), 1.5],
      [() => ({kind: 'good', key: 'city', text: 'Place a city tile.', value: V.CITY_VALUE, lasting: true, hintTag: Tag.CITY, category: 'city', apply: (d) => d.behavior.city = {}}), 1.5],
      [() => {
        const n = this.int(1, 2);
        return {kind: 'good', key: 'draw', text: `Draw ${plural(n, 'card')}.`, value: V.DRAW_CARD_VALUE * n, category: 'knowledge', apply: (d) => d.behavior.drawCard = n};
      }, 4],
      [() => {
        const n = this.int(1, 2);
        return {kind: 'good', key: 'vp', text: '', value: V.VP_VALUE * n, lasting: true, category: 'prestige', apply: (d) => d.victoryPoints = n};
      }, 4],
      [() => {
        const n = this.int(2, 4);
        return {kind: 'good', key: 'removePlants', text: `Remove up to ${n} plants from any player.`, value: V.REMOVE_PLANT_VALUE * n, category: 'blight', apply: (d) => d.behavior.removeAnyPlants = n};
      }, 0.6],
      [() => {
        const r = this.pick([Resource.MEGACREDITS, Resource.HEAT, Resource.PLANTS] as const);
        return {kind: 'good', key: 'decreaseAny', text: `Decrease any ${NAME[r]} production 1 step.`, value: V.DECREASE_ANY_PRODUCTION_VALUE, category: LOSS_CATEGORY[r],
          apply: (d) => d.behavior.decreaseAnyProduction = {type: r, count: 1}};
      }, 0.6],
    ])();
  }

  private gainStock(): Part {
    const r = this.pick(Object.keys(V.STOCK_VALUE) as Array<V.StandardResource>);
    const n = r === 'megacredits' ? this.int(2, 8) : this.int(1, 5);
    return {kind: 'good', key: `stock.${r}`, text: `Gain ${amount(n, r)}.`, value: V.STOCK_VALUE[r] * n, category: GAIN_CATEGORY[r],
      apply: (d) => d.behavior.stock = {...d.behavior.stock, [r]: n}};
  }

  private gainProduction(): Part {
    const r = this.weighted<V.StandardResource>([['megacredits', 4], ['steel', 2], ['titanium', 1], ['plants', 2], ['energy', 2], ['heat', 2]]);
    const n = r === 'megacredits' ? this.int(1, 3) : this.int(1, 2);
    const hint = r === 'energy' ? Tag.POWER : r === 'plants' ? Tag.PLANT : r === 'steel' ? Tag.BUILDING : r === 'titanium' ? Tag.SPACE : undefined;
    return {kind: 'good', key: `production.${r}`, text: `Increase your ${NAME[r]} production ${n} ${n === 1 ? 'step' : 'steps'}.`,
      value: V.PRODUCTION_VALUE[r] * n, lasting: true, hintTag: hint, category: GAIN_CATEGORY[r],
      apply: (d) => d.behavior.production = {...d.behavior.production, [r]: n}};
  }

  private raiseGlobal(): Part {
    const g = this.pick(['temperature', 'oxygen', 'venus'] as const);
    return {kind: 'good', key: `global.${g}`, text: `Raise ${g === 'venus' ? 'Venus' : g} 1 step.`, value: V.GLOBAL_STEP_VALUE[g], category: GLOBAL_CATEGORY[g],
      hintTag: g === 'venus' ? Tag.VENUS : undefined,
      apply: (d) => d.behavior.global = {...d.behavior.global, [g]: 1}};
  }

  private effectPart(): Part {
    return this.weighted<() => Part>([
      [() => {
        const r = this.pick(['steel', 'titanium', 'plants', 'heat', 'megacredits'] as const);
        const n = r === 'megacredits' ? 2 : 1;
        const one = V.STOCK_VALUE[r] * n;
        const text = `Action: Gain ${amount(n, r)}.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, value: one * V.ACTION_USES, category: GAIN_CATEGORY[r],
          apply: (d) => d.action = {stock: {[r]: n}}};
      }, 3],
      [() => {
        const [r, n] = this.pick([['steel', 2], ['titanium', 1], ['plants', 2], ['megacredits', 4]] as const);
        const one = V.STOCK_VALUE[r] * n - V.STOCK_VALUE.energy * 2;
        const text = `Action: Spend 2 energy to gain ${amount(n, r)}.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, value: one * V.ACTION_USES, hintTag: Tag.POWER, category: GAIN_CATEGORY[r],
          apply: (d) => d.action = {spend: {energy: 2}, stock: {[r]: n}}};
      }, 3],
      [() => {
        const g = this.pick(['temperature', 'oxygen'] as const);
        const one = V.GLOBAL_STEP_VALUE[g] - 4 * V.STOCK_VALUE.energy;
        const text = `Action: Spend 4 energy to raise ${g} 1 step.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, value: one * V.CONVERSION_ACTION_USES, hintTag: Tag.POWER, category: GLOBAL_CATEGORY[g],
          apply: (d) => d.action = {spend: {energy: 4}, global: {[g]: 1}}};
      }, 2],
      [() => {
        const x = this.int(1, 2);
        const text = `Effect: When you play a card, you pay ${x} M€ less for it.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, value: x * V.CARDS_PLAYED_AFTER, category: 'efficiency',
          apply: (d) => d.cardDiscount.push({amount: x})};
      }, 1],
      [() => {
        const tag = this.pick([Tag.SPACE, Tag.BUILDING, Tag.EARTH, Tag.SCIENCE, Tag.JOVIAN, Tag.VENUS, Tag.PLANT]);
        const x = this.int(2, 3);
        const text = `Effect: When you play ${an(tag)} tag, you pay ${x} M€ less for it.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, hintTag: tag, category: 'efficiency',
          value: x * V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[tag] ?? 0) * V.FOCUS_FACTOR,
          apply: (d) => d.cardDiscount.push({tag, amount: x})};
      }, 3],
      [() => {
        const tag = this.pick([Tag.SPACE, Tag.BUILDING, Tag.EARTH, Tag.SCIENCE, Tag.PLANT, Tag.MICROBE]);
        const [r, n] = this.pick([['megacredits', 2], ['plants', 1], ['steel', 1], ['heat', 2]] as const);
        const triggers = V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[tag] ?? 0) * V.FOCUS_FACTOR;
        const text = `Effect: When you play ${an(tag)} tag, gain ${amount(n, r)}.`;
        return {kind: 'effect', key: 'blue', blue: true, text: '', effectText: text, hintTag: tag, category: 'synergy', value: V.STOCK_VALUE[r] * n * triggers,
          selfTrigger: {tag, value: V.STOCK_VALUE[r] * n},
          apply: (d) => d.trigger = {tag, gain: {[r]: n}}};
      }, 3],
    ])();
  }

  private badPart(): Part {
    return this.weighted<() => Part>([
      [() => {
        const r = this.weighted<keyof typeof LOSS_CATEGORY>([['megacredits', 4], ['energy', 3], ['heat', 1], ['plants', 1]]);
        const n = r === 'megacredits' ? this.int(1, 2) : 1;
        return {kind: 'bad', key: `production.${r}`, text: `Decrease your ${NAME[r]} production ${n} ${n === 1 ? 'step' : 'steps'}.`,
          value: -V.PRODUCTION_VALUE[r] * n, category: LOSS_CATEGORY[r], apply: (d) => d.behavior.production = {...d.behavior.production, [r]: -n}};
      }, 5],
      [() => {
        const r = this.pick(['plants', 'heat', 'energy'] as const);
        const n = this.int(2, 4);
        return {kind: 'bad', key: 'lose', text: `Lose ${amount(n, r)}.`, value: -V.STOCK_VALUE[r] * n, category: LOSS_CATEGORY[r],
          apply: (d) => d.behavior.lose = {stock: {[r]: n}}};
      }, 3],
      [() => ({kind: 'bad', key: 'vp', text: '', value: -V.VP_VALUE, category: 'infamy', apply: (d) => d.victoryPoints = -1}), 2],
      [() => {
        const tag = this.pick([Tag.SPACE, Tag.BUILDING, Tag.EARTH, Tag.SCIENCE]);
        const text = `Effect: When you play ${an(tag)} tag, you pay 1 M€ more for it.`;
        return {kind: 'bad', key: 'blue', blue: true, text: '', effectText: text,
          value: -V.CARDS_PLAYED_AFTER * (V.TAG_SHARE[tag] ?? 0), category: 'debt', apply: (d) => d.cardDiscount.push({tag, amount: -1})};
      }, 1.5],
      [() => ({kind: 'bad', key: 'blue', blue: true, text: '', effectText: 'Effect: When you play a card, you pay 1 M€ more for it.',
        value: -V.CARDS_PLAYED_AFTER, category: 'debt', apply: (d) => d.cardDiscount.push({amount: -1})}), 0.7],
    ])();
  }

  private requirement(): {descriptor: CardRequirementDescriptor, text: string, value: number, tag?: Tag} {
    if (this.chance(0.55)) {
      const g = this.pick(Object.keys(GLOBALS) as Array<keyof typeof GLOBALS>);
      const G = GLOBALS[g];
      const isMax = this.chance(0.25);
      const steps = (G.max - G.start) / G.step;
      const at = G.start + G.step * this.int(isMax ? 1 : 2, Math.floor(steps * (isMax ? 0.5 : 0.75)));
      const frac = (at - G.start) / (G.max - G.start);
      const value = isMax ? V.GLOBAL_MAX_REQUIREMENT * (1 - frac) : V.GLOBAL_MIN_REQUIREMENT * frac;
      const descriptor: CardRequirementDescriptor = isMax ? {[g]: at, max: true} : {[g]: at};
      return {descriptor, value, text: isMax ? `It must be ${G.text(at)} or less.` : `Requires ${G.text(at)} or more.`};
    }
    const tag = this.weighted<Tag>([[Tag.SCIENCE, 4], [Tag.EARTH, 2], [Tag.JOVIAN, 1], [Tag.BUILDING, 2], [Tag.SPACE, 2], [Tag.PLANT, 1], [Tag.VENUS, 1], [Tag.POWER, 1]]);
    const count = this.weighted<number>([[1, 3], [2, 4], [3, 3], [4, 1], [5, 0.5]]);
    return {descriptor: {tag, count}, value: -Math.pow(count, V.TAG_REQUIREMENT_EXPONENT), tag,
      text: `Requires ${count} ${tag} ${count === 1 ? 'tag' : 'tags'}.`};
  }

  /**
   * A random part of this category, for presets that guarantee an effect. Bane categories
   * (cooling, blight, ...) come as drawbacks or as sabotage against another player.
   */
  private partOf(category: EffectCategory): Part {
    for (let i = 0; i < 1000; i++) {
      const kind = this.pick(['good', 'effect', 'bad'] as const);
      const part = kind === 'good' ? this.goodPart() : kind === 'effect' ? this.effectPart() : this.badPart();
      if (part.category === category) {
        return part;
      }
    }
    throw new Error(`Assembler has no ${category} part`);
  }

  // ---- the card ----------------------------------------------------------------------------------

  /**
   * @param name the card's unique name (see AssembledCardDefinition.name).
   * Tries random cards until one is sensibly priced and fits on a card. Throws only if 2000 tries all fail.
   * @param spec optional constraints (a preset): required tags, tag count, cost range, cost adjustment.
   */
  public generate(name: string, complexity: AssemblerComplexity, spec: AssembleSpec = {}): AssembledCardDefinition {
    for (let attempt = 0; attempt < 2000; attempt++) {
      const card = this.tryGenerate(name, complexity, spec);
      // Reroll cards too busy to print legibly, rather than letting text run off the card.
      if (card !== undefined && fitsOnCard(card)) {
        return card;
      }
    }
    throw new Error(`Assembler could not build a ${complexity} card`);
  }

  private tryGenerate(name: string, complexity: AssemblerComplexity, spec: AssembleSpec): AssembledCardDefinition | undefined {
    const forceRequirement = spec.forceRequirement === true;
    const profile = PROFILE[complexity];
    // Chosen first, so a minimum cost (below) can make up for what the requirement takes off.
    const requirement = (forceRequirement || this.chance(profile.requirementChance)) ? this.requirement() : undefined;
    // Guaranteed effects first. Everything takes a slot: guaranteed parts, the requirement, an
    // effect or action, drawbacks. Benefits fill what's left (at least one thing must be good).
    const parts: Array<Part> = [...new Set(spec.categories ?? [])].map((c) => this.partOf(c));
    const has = (kind: PartKind) => parts.filter((p) => p.kind === kind).length;
    const slots = this.int(...profile.slots);
    if (has('effect') === 0 && this.chance(profile.effectChance)) {
      parts.push(this.effectPart());
    }
    // An active card needs an effect or action.
    if (spec.type === CardType.ACTIVE && !parts.some((p) => p.blue === true)) {
      parts.push(this.effectPart());
    }
    const nBad = this.int(...profile.bad) - has('bad');
    for (let i = 0; i < nBad; i++) {
      parts.push(this.badPart());
    }
    const used = parts.length + (requirement !== undefined ? 1 : 0);
    const nGood = Math.max(has('good') + has('effect') === 0 ? 1 : 0, slots - used);
    for (let i = 0; i < nGood; i++) {
      parts.push(this.goodPart());
    }
    // A minimum cost: add good parts until the card is worth about enough. Pricing below decides.
    // Each time, take the candidate that lands closest to the target: a big part while far below
    // it (fewer parts still fit on the card), a small one near it (so the cost doesn't overshoot).
    if (spec.minCost !== undefined) {
      const target = spec.minCost + V.BUY_COST - 3 - (requirement?.value ?? 0); // tags add roughly 3
      const sum = () => parts.reduce((s, p) => s + p.value, 0);
      for (let tries = 0; tries < 20 && parts.length < 7 && sum() < target; tries++) {
        const remaining = target - sum();
        const candidates = [this.goodPart(), this.goodPart(), this.goodPart(), this.goodPart()].filter((p) => !parts.some((q) => q.key === p.key));
        const best = candidates.sort((a, b) => Math.abs(remaining - a.value) - Math.abs(remaining - b.value))[0];
        if (best !== undefined) {
          parts.push(best);
        }
      }
    }

    const keys = parts.map((p) => p.key);
    if (new Set(keys).size !== keys.length) {
      return undefined;
    }
    // A card that only takes things away isn't a card.
    if (!parts.some((p) => p.kind !== 'bad' && p.value > 0)) {
      return undefined;
    }

    const blue = parts.some((p) => p.blue === true);
    const lasting = parts.some((p) => p.lasting === true);
    // A preset that asks for tags wants them to stay in play, so it never makes an event. Neither
    // does a 4+ tag card: with the event tag on top the client would collapse the tags to one icon.
    const eventAllowed = (spec.tags ?? []).length === 0 && (spec.tagCount ?? 0) < 4;
    let type = blue ? CardType.ACTIVE : (!lasting && eventAllowed && this.chance(0.6) ? CardType.EVENT : CardType.AUTOMATED);
    if (spec.type !== undefined) {
      // An event can't hold anything lasting; an automated card can't hold an effect.
      if ((spec.type === CardType.EVENT && (blue || lasting)) || (spec.type === CardType.AUTOMATED && blue)) {
        return undefined;
      }
      type = spec.type;
    }
    // Negative VP on an event reads oddly; keep VP on cards that stay in play.
    if (type === CardType.EVENT && parts.some((p) => p.key === 'vp')) {
      return undefined;
    }

    // Tags: lean toward one that fits the parts.
    const required = [...new Set(spec.tags ?? [])];
    const tags: Array<Tag> = [...required];
    const nTags = Math.max(spec.tagCount ?? this.int(...profile.tags), required.length);
    const hint = parts.find((p) => p.hintTag !== undefined)?.hintTag;
    if (hint !== undefined && tags.length < nTags && !tags.includes(hint) && this.chance(0.7)) {
      tags.push(hint);
    }
    while (tags.length < nTags) {
      const t = this.weighted(TAG_WEIGHTS);
      if (!tags.includes(t)) {
        tags.push(t);
      }
    }

    // Science-requirement cards tend to be science cards -- unless that would drop a required tag.
    if (requirement?.tag !== undefined && !tags.includes(requirement.tag) && tags.length > required.length && this.chance(0.5)) {
      tags[tags.length - 1] = requirement.tag;
    }

    // A trigger on a tag the card has fires for the card itself too (like Olympus Conference): say
    // so, and count that one extra payout.
    for (const [i, p] of parts.entries()) {
      if (p.selfTrigger !== undefined && tags.includes(p.selfTrigger.tag)) {
        parts[i] = {...p, value: p.value + p.selfTrigger.value, effectText: p.effectText?.replace(' tag, gain ', ' tag, including this, gain ')};
      }
    }

    // ---- price ----
    const breakdown: Array<AssembledValueLine> = [];
    for (const p of parts) {
      const text = p.key === 'vp' ? `${p.value > 0 ? '' : '−'}${Math.round(Math.abs(p.value / V.VP_VALUE))} VP` : (p.effectText ?? p.text);
      breakdown.push({text, value: p.value, category: p.category});
    }
    const tagValues = tags.map((t) => V.TAG_VALUE[t] ?? 0).sort((a, b) => b - a);
    let tagValue = tagValues.reduce((s, v, i) => s + v * (i === 0 ? 1 : V.EXTRA_TAG_FACTOR), 0);
    if (type === CardType.EVENT) {
      tagValue = tagValue * V.EVENT_TAG_FACTOR + V.EVENT_TAG_VALUE;
    }
    breakdown.push({text: `Tags: ${tags.join(', ')}${type === CardType.EVENT ? ' (event)' : ''}`, value: tagValue});
    if (requirement !== undefined) {
      breakdown.push({text: requirement.text, value: requirement.value});
    }

    const baseValue = breakdown.reduce((s, l) => s + l.value, 0);
    // Steel/titanium payment grows with the cost, so solve cost = base + flat + share * cost - BUY_COST.
    let flat = 0;
    let share = 0;
    for (const t of tags) {
      const pay = V.PAYMENT_VALUE[t];
      if (pay !== undefined) {
        flat += pay.flat;
        share += pay.ofCost;
      }
    }
    const exactCost = (baseValue + flat - V.BUY_COST) / (1 - share);
    if (flat > 0) {
      breakdown.push({text: 'Pay with steel/titanium', value: flat + share * exactCost});
    }
    // Round the value first and derive the cost from it, so cost = round(value - 3) holds exactly for the shown value.
    const value = Math.round((exactCost + V.BUY_COST) * 10) / 10;
    const pricedCost = Math.round(value - V.BUY_COST);
    if (pricedCost < Math.max(V.MIN_COST, spec.minCost ?? 0) || pricedCost > Math.min(V.MAX_COST, spec.maxCost ?? Infinity)) {
      return undefined;
    }
    const costAdjust = spec.costAdjust ?? 0;
    const cost = Math.max(0, pricedCost + costAdjust);

    // ---- build ----
    const draft: Draft = {behavior: {}, cardDiscount: [], victoryPoints: 0};
    for (const p of parts) {
      p.apply(draft);
    }
    // "Lose 4 heat. Gain 5 heat." is nonsense: never lose and gain the same resource.
    const lost = Object.keys(draft.behavior.lose?.stock ?? {});
    if (lost.some((r) => Object.keys(draft.behavior.stock ?? {}).includes(r))) {
      return undefined;
    }

    const playTexts = parts.filter((p) => p.text !== '' && p.effectText === undefined).map((p) => p.text);
    const description = [requirement?.text, ...compactTexts(playTexts)].filter((t) => t !== undefined).join(' ');
    const effectTexts = parts.filter((p) => p.effectText !== undefined).map((p) => p.effectText as string);
    // Forced extras (a guaranteed drawback, a requirement, a minimum cost) can make a card busier
    // than asked for; it then says so.
    const actual = complexityOfSlots(parts.length + (requirement !== undefined ? 1 : 0));
    const shown = COMPLEXITY_ORDER.indexOf(actual) > COMPLEXITY_ORDER.indexOf(complexity) ? actual : complexity;
    const title = nameCard(parts.map((p) => ({category: p.category, value: p.value, bad: p.kind === 'bad'})), shown, (items) => this.pick(items));

    return {
      name,
      title,
      complexity: shown,
      type,
      cost,
      tags,
      requirements: requirement !== undefined ? [requirement.descriptor] : [],
      victoryPoints: draft.victoryPoints !== 0 ? draft.victoryPoints : undefined,
      behavior: Object.keys(draft.behavior).length > 0 ? draft.behavior : undefined,
      action: draft.action,
      cardDiscount: draft.cardDiscount.length > 0 ? draft.cardDiscount : undefined,
      trigger: draft.trigger,
      description,
      effectTexts,
      value,
      breakdown: breakdown.map((l) => ({...l, value: Math.round(l.value * 10) / 10})),
      costAdjust: costAdjust !== 0 ? costAdjust : undefined,
    };
  }
}
