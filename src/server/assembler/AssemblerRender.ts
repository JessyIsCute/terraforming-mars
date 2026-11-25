import {CardRenderer} from '../cards/render/CardRenderer';
import {all, digit, uppercase} from '../cards/Options';
import {Units} from '../../common/Units';
import {Behavior} from '../behavior/Behavior';
import {AssembledCardDefinition} from './AssembledCardDefinition';
import {Tag} from '../../common/cards/Tag';
import {CardResource} from '../../common/CardResource';

const RESOURCES = ['megacredits', 'steel', 'titanium', 'plants', 'energy', 'heat'] as const;
type Resource = typeof RESOURCES[number];

/** The subset of the render builder API this file uses; CardRenderer's builders all share it. */
type ItemBuilder = {
  [R in Resource]: (amount: number, options?: {all?: boolean, digit?: boolean}) => ItemBuilder;
} & {
  minus(): ItemBuilder;
  plus(): ItemBuilder;
  slash(): ItemBuilder;
  tag(tag: Tag, amount?: number): ItemBuilder;
  resource(type: CardResource, amount?: number): ItemBuilder;
  asterix(): ItemBuilder;
  readonly nbsp: ItemBuilder;
};

/** "1 VP per 2 animals on this card." */
function vpText(def: AssembledCardDefinition): string | undefined {
  const r = def.cardResource;
  if (r?.vpPer === undefined) {
    return undefined;
  }
  const word = r.type.toLowerCase();
  return `1 VP per ${r.vpPer === 1 ? word : `${r.vpPer} ${word}s`} on this card.`;
}

/** Production that grows with a tag count (Insects, Medical Lab): {resource, tag, per}. */
function perTag(behavior: Behavior): {r: Resource, tag: Tag, per: number} | undefined {
  for (const r of RESOURCES) {
    const n = behavior.production?.[r];
    if (typeof n === 'object' && n !== null) {
      const c = n as {tag?: Tag | ReadonlyArray<Tag>, per?: number};
      if (typeof c.tag === 'string') {
        return {r, tag: c.tag as Tag, per: c.per ?? 1};
      }
    }
  }
  return undefined;
}
/** Icon widths of "1 M€ / 2 building tags". */
const PER_TAG_WIDTH = 3;

/** From this many of one resource, draw one icon with a number, like printed cards do. */
const DIGIT_FROM = 4;
/**
 * How many icon widths fit side by side on a card row. One width is a resource icon with its
 * margin, about 36px; widths below were measured in the browser (e.g. the Venus gauge is 60px).
 */
const ROW_WIDTH = 6;
/** The space between two effects on a row. */
const GAP = 0.2;

/** How many icon widths an amount takes. A number next to an icon ("4 heat") is about one and a half. */
function iconCount(r: Resource, n: number): number {
  if (r === 'megacredits') {
    return 1;
  }
  return Math.abs(n) >= DIGIT_FROM ? 1.5 : Math.abs(n);
}

function units(b: ItemBuilder, u: Partial<Units> | undefined) {
  for (const r of RESOURCES) {
    const n = u?.[r];
    if (typeof n === 'number' && n !== 0) {
      const amount = Math.abs(n);
      b[r](amount, r !== 'megacredits' && amount >= DIGIT_FROM ? {digit} : undefined);
    }
  }
}

function unitsWidth(u: Partial<Record<Resource, number>> | undefined): number {
  let w = 0;
  for (const r of RESOURCES) {
    const n = u?.[r];
    if (typeof n === 'number' && n !== 0) {
      w += iconCount(r, n);
    }
  }
  return w;
}

function numbers(u: Behavior['production'] | undefined): Partial<Record<Resource, number>> {
  const out: Partial<Record<Resource, number>> = {};
  for (const r of RESOURCES) {
    const n = u?.[r];
    if (typeof n === 'number' && n !== 0) {
      out[r] = n;
    }
  }
  return out;
}

function stripLabel(text: string | undefined): string | undefined {
  return text?.replace(/^(Action|Effect): /, '');
}

/** Draws an assembled card with the game's own card renderer, from the definition's data alone. */
export function renderAssembled(def: AssembledCardDefinition) {
  const texts = def.effectTexts;
  const actionText = stripLabel(texts.find((t) => t.startsWith('Action')));
  const discountTexts = texts.filter((t) => t.startsWith('Effect') && t.includes(' pay ')).map(stripLabel);
  const triggerText = stripLabel(texts.find((t) => t.startsWith('Effect') && / tag, (including this, )?(gain|draw|add) /.test(t)));

  return CardRenderer.runtimeBuilder((b) => {
    const action = def.action;
    if (action !== undefined) {
      b.action(actionText, (eb) => {
        const spentEnergy = action.spend?.energy;
        if (action.addResources !== undefined && def.cardResource !== undefined) {
          eb.empty().startAction.resource(def.cardResource.type);
          return;
        }
        if (typeof spentEnergy === 'number') {
          eb.energy(spentEnergy, {digit});
        } else {
          eb.empty();
        }
        eb.startAction;
        units(eb as unknown as ItemBuilder, action.stock as Partial<Units>);
        if (action.global?.temperature) {
          eb.temperature(1);
        }
        if (action.global?.oxygen) {
          eb.oxygen(1);
        }
      }).br;
    }

    (def.cardDiscount ?? []).forEach((discount, i) => {
      b.effect(discountTexts[i], (eb) => {
        if (discount.tag !== undefined) {
          eb.tag(discount.tag);
        } else {
          eb.empty();
        }
        eb.startEffect.megacredits(-discount.amount);
      }).br;
    });

    const trigger = def.trigger;
    if (trigger !== undefined) {
      b.effect(triggerText, (eb) => {
        eb.tag(trigger.tag).startEffect;
        units(eb as unknown as ItemBuilder, trigger.gain);
        if (trigger.drawCard !== undefined) {
          eb.cards(trigger.drawCard);
        }
        if (trigger.addResource !== undefined && def.cardResource !== undefined) {
          eb.resource(def.cardResource.type, trigger.addResource);
        }
      }).br;
    }

    const behavior = def.behavior ?? {};
    const production = numbers(behavior.production);
    const decreaseAny = behavior.decreaseAnyProduction;
    const losses = Object.fromEntries(Object.entries(production).filter(([, n]) => n < 0));
    const gains = Object.fromEntries(Object.entries(production).filter(([, n]) => n > 0));
    const hasLoss = Object.keys(losses).length > 0 || decreaseAny !== undefined;
    const growth = perTag(behavior);
    const hasGain = Object.keys(gains).length > 0 || growth !== undefined;
    const instant = instantGroups(def);
    if (hasLoss || hasGain) {
      b.production((pb) => {
        const p = pb as unknown as ItemBuilder;
        if (hasLoss) {
          p.minus();
          units(p, losses);
          if (decreaseAny !== undefined) {
            p[decreaseAny.type as Resource](decreaseAny.count, {all});
          }
          if (hasGain) {
            pb.br;
            p.plus();
          }
        }
        units(p, gains);
        if (growth !== undefined) {
          if (Object.keys(gains).length > 0) {
            p.nbsp;
          }
          p[growth.r](1).slash().tag(growth.tag, growth.per > 1 ? growth.per : undefined);
        }
      });
      // Like printed cards, small one-off effects share the production box's row.
      if (instant.length > 0 && productionWidth(behavior) + GAP + instantWidth(instant) <= ROW_WIDTH) {
        b.nbsp;
      } else {
        b.br;
      }
    }
    // One-off effects, wrapping onto a new row when it gets too wide.
    let width = 0;
    for (const group of instant) {
      if (width > 0 && width + GAP + group.width > ROW_WIDTH) {
        b.br;
        width = 0;
      } else if (width > 0) {
        b.nbsp;
        width += GAP;
      }
      group.draw(b as unknown as RowBuilder);
      width += group.width;
    }
    const vp = vpText(def);
    if (vp !== undefined) {
      b.br;
      b.vpText(vp);
    }
  });
}

type RowBuilder = ItemBuilder & {
  temperature(n: number): RowBuilder;
  oxygen(n: number): RowBuilder;
  venus(n: number): RowBuilder;
  tr(n: number): RowBuilder;
  oceans(n: number): RowBuilder;
  greenery(): RowBuilder;
  city(): RowBuilder;
  cards(n: number, options?: {all?: boolean, digit?: boolean}): RowBuilder;
  text(text: string, options?: {uppercase?: boolean}): RowBuilder;
};

/** A one-off play effect: how to draw it, and how many icons wide it is. */
type Group = {width: number, draw: (b: RowBuilder) => void};

function instantGroups(def: AssembledCardDefinition): Array<Group> {
  const behavior = def.behavior ?? {};
  const groups: Array<Group> = [];
  const lose = behavior.lose?.stock as Partial<Units> | undefined;
  if (lose !== undefined) {
    groups.push({width: unitsWidth(lose) + 0.5, draw: (b) => {
      b.minus();
      units(b, lose);
    }});
  }
  const stock = behavior.stock as Partial<Units> | undefined;
  if (stock !== undefined) {
    groups.push({width: unitsWidth(stock), draw: (b) => units(b, stock)});
  }
  const g = behavior.global;
  if (g?.temperature) {
    const n = g.temperature;
    groups.push({width: 0.6 * n, draw: (b) => b.temperature(n)});
  }
  if (g?.oxygen) {
    const n = g.oxygen;
    groups.push({width: 1.4 * n, draw: (b) => b.oxygen(n)});
  }
  if (g?.venus) {
    const n = g.venus;
    groups.push({width: 1.8 * n, draw: (b) => b.venus(n)});
  }
  if (typeof behavior.tr === 'number') {
    const n = behavior.tr;
    groups.push({width: 1.6 * n, draw: (b) => b.tr(n)});
  }
  if (behavior.ocean !== undefined) {
    const n = behavior.ocean.count ?? 1;
    groups.push({width: 1.3, draw: (b) => b.oceans(n)});
  }
  if (behavior.greenery !== undefined) {
    groups.push({width: 1.4, draw: (b) => b.greenery()});
  }
  if (behavior.city !== undefined) {
    groups.push({width: 1.3, draw: (b) => b.city()});
  }
  if (typeof behavior.drawCard === 'number') {
    const n = behavior.drawCard;
    groups.push({width: n >= DIGIT_FROM ? 1.5 : n, draw: (b) => b.cards(n, n >= DIGIT_FROM ? {digit} : undefined)});
  }
  const steal = def.steal;
  if (steal !== undefined) {
    const r = steal.resource as Resource;
    groups.push({width: 1.6 + iconCount(r, steal.count), draw: (b) => {
      b.text('steal', {uppercase});
      b[r](steal.count, steal.count >= DIGIT_FROM && r !== 'megacredits' ? {all, digit} : {all});
    }});
  }
  if (def.discard !== undefined) {
    const n = def.discard;
    groups.push({width: n + 0.5, draw: (b) => {
      b.minus();
      b.cards(n);
    }});
  }
  if (def.opponentsDiscard !== undefined) {
    // Every opponent: "EACH -card" in red, so it reads apart from the one-opponent version.
    const n = def.opponentsDiscard;
    groups.push({width: n + 1.9, draw: (b) => {
      b.text('each', {uppercase});
      b.minus();
      b.cards(n, {all});
    }});
  }
  if (def.targetDiscard !== undefined) {
    const n = def.targetDiscard;
    groups.push({width: n + 0.5, draw: (b) => {
      b.minus();
      b.cards(n, {all});
    }});
  }
  const addAny = behavior.addResourcesToAnyCard;
  if (addAny !== undefined && !Array.isArray(addAny) && addAny.type !== undefined) {
    const n = typeof addAny.count === 'number' ? addAny.count : 1;
    const type = addAny.type;
    groups.push({width: n + 0.4, draw: (b) => {
      b.resource(type, n).asterix();
    }});
  }
  if (behavior.removeAnyPlants !== undefined) {
    const n = Math.abs(behavior.removeAnyPlants);
    groups.push({width: iconCount('plants', n) + 0.5, draw: (b) => {
      b.minus();
      b.plants(n, n >= DIGIT_FROM ? {all, digit} : {all});
    }});
  }
  return groups;
}

/** Width of the groups on one row, gaps included. */
function instantWidth(groups: Array<Group>): number {
  return groups.reduce((w, g) => w + g.width, 0) + GAP * Math.max(0, groups.length - 1);
}

/** Width of the widest production-box row, plus the box's border. */
function productionWidth(behavior: Behavior): number {
  const production = numbers(behavior.production);
  const lossWidth = unitsWidth(Object.fromEntries(Object.entries(production).filter(([, n]) => n < 0))) +
    (behavior.decreaseAnyProduction?.count ?? 0);
  const gainWidth = unitsWidth(Object.fromEntries(Object.entries(production).filter(([, n]) => n > 0))) +
    (perTag(behavior) !== undefined ? PER_TAG_WIDTH : 0);
  return Math.max(lossWidth, gainWidth) + (lossWidth > 0 ? 0.5 : 0) + 1;
}

// Card face pixel budget below the title: the card is 308px tall and content starts at ~68px.
const CONTENT_HEIGHT = 225;
// The VP box covers the bottom right of the card.
const CONTENT_HEIGHT_WITH_VP = 185;
const ROW_HEIGHT = 50;
const PRODUCTION_ROW_HEIGHT = 36;
const EFFECT_HEIGHT = 50;
const REQUIREMENT_HEIGHT = 24;
const LINE_HEIGHT = 13;
// Padding around the content block.
const BASE_HEIGHT = 30;
const CHARS_PER_LINE = 42;

function textHeight(text: string | undefined): number {
  return text === undefined || text === '' ? 0 : Math.ceil(text.length / CHARS_PER_LINE) * LINE_HEIGHT + 4;
}

/**
 * Roughly how tall the card face's content is, in pixels, so the generator can reroll cards that
 * wouldn't fit. Calibrated by measuring rendered cards in the client.
 */
export function estimateContentHeight(def: AssembledCardDefinition): number {
  let h = BASE_HEIGHT;
  if (def.requirements.length > 0) {
    h += REQUIREMENT_HEIGHT;
  }
  for (const t of def.effectTexts) {
    h += EFFECT_HEIGHT + textHeight(stripLabel(t));
  }
  const behavior = def.behavior ?? {};
  {
    const production = Object.values(numbers(behavior.production));
    const hasLoss = production.some((n) => n < 0) || behavior.decreaseAnyProduction !== undefined;
    const hasGain = production.some((n) => n > 0) || perTag(behavior) !== undefined;
    const instant = instantGroups(def);
    let width = instantWidth(instant);
    if (hasLoss || hasGain) {
      h += ROW_HEIGHT + (hasLoss && hasGain ? PRODUCTION_ROW_HEIGHT : 0);
      if (instant.length > 0 && productionWidth(behavior) + GAP + width <= ROW_WIDTH) {
        width = 0;
      }
    }
    h += Math.ceil(width / ROW_WIDTH) * ROW_HEIGHT;
  }
  // The VP text sits beside the VP box, in the space CONTENT_HEIGHT_WITH_VP already leaves out.
  return h + textHeight(def.description);
}

/** Whether the card's face fits on a card without text running off it or under the VP box. */
export function fitsOnCard(def: AssembledCardDefinition): boolean {
  const vp = def.victoryPoints !== undefined || def.cardResource?.vpPer !== undefined;
  return estimateContentHeight(def) <= (vp ? CONTENT_HEIGHT_WITH_VP : CONTENT_HEIGHT);
}
