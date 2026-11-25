import {CardRenderer} from '../cards/render/CardRenderer';
import {all, digit} from '../cards/Options';
import {Units} from '../../common/Units';
import {Behavior} from '../behavior/Behavior';
import {AssembledCardDefinition} from './AssembledCardDefinition';

const RESOURCES = ['megacredits', 'steel', 'titanium', 'plants', 'energy', 'heat'] as const;
type Resource = typeof RESOURCES[number];

/** The subset of the render builder API this file uses; CardRenderer's builders all share it. */
type ItemBuilder = {
  [R in Resource]: (amount: number, options?: {all?: boolean, digit?: boolean}) => ItemBuilder;
} & {
  minus(): ItemBuilder;
  plus(): ItemBuilder;
  readonly nbsp: ItemBuilder;
};

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
  const triggerText = stripLabel(texts.find((t) => t.startsWith('Effect') && t.includes(', gain ')));

  return CardRenderer.runtimeBuilder((b) => {
    const action = def.action;
    if (action !== undefined) {
      b.action(actionText, (eb) => {
        const spentEnergy = action.spend?.energy;
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
      }).br;
    }

    const behavior = def.behavior;
    if (behavior === undefined) {
      return;
    }

    const production = numbers(behavior.production);
    const decreaseAny = behavior.decreaseAnyProduction;
    const losses = Object.fromEntries(Object.entries(production).filter(([, n]) => n < 0));
    const gains = Object.fromEntries(Object.entries(production).filter(([, n]) => n > 0));
    const hasLoss = Object.keys(losses).length > 0 || decreaseAny !== undefined;
    const hasGain = Object.keys(gains).length > 0;
    const instant = instantGroups(behavior);
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
  cards(n: number): RowBuilder;
};

/** A one-off play effect: how to draw it, and how many icons wide it is. */
type Group = {width: number, draw: (b: RowBuilder) => void};

function instantGroups(behavior: Behavior): Array<Group> {
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
    groups.push({width: 0.6, draw: (b) => b.temperature(n)});
  }
  if (g?.oxygen) {
    const n = g.oxygen;
    groups.push({width: 1.4, draw: (b) => b.oxygen(n)});
  }
  if (g?.venus) {
    const n = g.venus;
    groups.push({width: 1.8, draw: (b) => b.venus(n)});
  }
  if (typeof behavior.tr === 'number') {
    const n = behavior.tr;
    groups.push({width: 1.6, draw: (b) => b.tr(n)});
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
    groups.push({width: n, draw: (b) => b.cards(n)});
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
  const gainWidth = unitsWidth(Object.fromEntries(Object.entries(production).filter(([, n]) => n > 0)));
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
  const behavior = def.behavior;
  if (behavior !== undefined) {
    const production = Object.values(numbers(behavior.production));
    const hasLoss = production.some((n) => n < 0) || behavior.decreaseAnyProduction !== undefined;
    const hasGain = production.some((n) => n > 0);
    const instant = instantGroups(behavior);
    let width = instantWidth(instant);
    if (hasLoss || hasGain) {
      h += ROW_HEIGHT + (hasLoss && hasGain ? PRODUCTION_ROW_HEIGHT : 0);
      if (instant.length > 0 && productionWidth(behavior) + GAP + width <= ROW_WIDTH) {
        width = 0;
      }
    }
    h += Math.ceil(width / ROW_WIDTH) * ROW_HEIGHT;
  }
  return h + textHeight(def.description);
}

/** Whether the card's face fits on a card without text running off it or under the VP box. */
export function fitsOnCard(def: AssembledCardDefinition): boolean {
  return estimateContentHeight(def) <= (def.victoryPoints !== undefined ? CONTENT_HEIGHT_WITH_VP : CONTENT_HEIGHT);
}
