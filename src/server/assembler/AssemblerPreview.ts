import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {CardModel} from '../../common/models/CardModel';
import {SeededRandom} from '../../common/utils/Random';
import {EFFECT_CATEGORY_INFO, EffectCategory, isEffectCategory} from '../../common/assembler/EffectCategory';
import {ASSEMBLER_PREVIEW_LIMITS as LIMITS, ASSEMBLER_PREVIEW_TAGS, AssemblerPreviewResponse} from '../../common/assembler/AssemblerPreview';
import {CardName} from '../../common/cards/CardName';
import {forgetCardProperties} from '../cards/Card';
import {addAssembledCardModel} from '../models/ModelUtils';
import {AssembleSpec, AssemblerComplexity} from './AssembleSpec';
import {AssemblerGenerator} from './AssemblerGenerator';
import {AssemblerExpansion} from './AssemblerExpansion';
import {newAssembledCard} from './AssembledCard';

/** A request the player can fix: the message is shown on the generator page. */
export class AssemblerPreviewError extends Error {}

export type AssemblerPreviewRequest = {
  count: number,
  seed: number,
  spec: AssembleSpec,
};

/** Categories that only come as an effect or action. A card has at most one of those. */
const EFFECT_ONLY: ReadonlyArray<EffectCategory> = ['efficiency', 'synergy'];

function integer(params: URLSearchParams, key: string, min: number, max: number): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw === '') {
    return undefined;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new AssemblerPreviewError(`${key} must be a whole number from ${min} to ${max}.`);
  }
  return n;
}

function list(params: URLSearchParams, key: string): Array<string> {
  return (params.get(key) ?? '').split(',').map((s) => s.trim()).filter((s) => s !== '');
}

/** Reads and checks the generator page's query. Throws AssemblerPreviewError for bad or impossible options. */
export function parsePreviewRequest(params: URLSearchParams, randomSeed: () => number): AssemblerPreviewRequest {
  const spec: {-readonly [K in keyof AssembleSpec]: AssembleSpec[K]} = {};

  const complexity = params.get('complexity');
  if (complexity !== null && complexity !== '') {
    if (complexity !== 'low' && complexity !== 'mid' && complexity !== 'high') {
      throw new AssemblerPreviewError('complexity must be low, mid or high.');
    }
    spec.complexity = complexity as AssemblerComplexity;
  }

  const type = params.get('type');
  if (type !== null && type !== '') {
    if (type !== CardType.AUTOMATED && type !== CardType.ACTIVE && type !== CardType.EVENT) {
      throw new AssemblerPreviewError('type must be automated, active or event.');
    }
    spec.type = type;
  }

  const categories = list(params, 'categories');
  for (const c of categories) {
    if (!isEffectCategory(c)) {
      throw new AssemblerPreviewError(`Unknown effect: ${c}.`);
    }
  }
  if (categories.length > 0) {
    spec.categories = categories as Array<EffectCategory>;
  }

  const tags = list(params, 'tags');
  for (const t of tags) {
    if (!(ASSEMBLER_PREVIEW_TAGS as ReadonlyArray<string>).includes(t)) {
      throw new AssemblerPreviewError(`Unknown tag: ${t}.`);
    }
  }
  if (tags.length > 0) {
    spec.tags = tags as Array<Tag>;
  }

  spec.tagCount = integer(params, 'tagCount', 1, LIMITS.MAX_TAG_COUNT);
  spec.minCost = integer(params, 'minCost', 0, LIMITS.MAX_COST);
  spec.maxCost = integer(params, 'maxCost', 0, LIMITS.MAX_COST);
  spec.costAdjust = integer(params, 'costAdjust', -LIMITS.MAX_COST_ADJUST, LIMITS.MAX_COST_ADJUST);
  if (params.get('requirement') === '1') {
    spec.forceRequirement = true;
  }

  // Combinations that can never work, explained rather than left to fail.
  const effectOnly = categories.filter((c) => EFFECT_ONLY.includes(c as EffectCategory));
  const label = (c: string) => EFFECT_CATEGORY_INFO[c as EffectCategory].label;
  if (effectOnly.length > 1) {
    throw new AssemblerPreviewError(`A card has only one effect, so ${effectOnly.map(label).join(' and ')} can't both be guaranteed.`);
  }
  if (effectOnly.length > 0 && (spec.type === CardType.EVENT || spec.type === CardType.AUTOMATED)) {
    throw new AssemblerPreviewError(`${label(effectOnly[0])} is an effect, so the card must be active.`);
  }
  if (spec.type === CardType.EVENT && categories.includes('city')) {
    throw new AssemblerPreviewError('A city stays in play, so it can\'t be on an event.');
  }
  if (spec.minCost !== undefined && spec.maxCost !== undefined && spec.minCost > spec.maxCost) {
    throw new AssemblerPreviewError('The lowest cost is above the highest cost.');
  }
  if (spec.tagCount !== undefined && tags.length > spec.tagCount) {
    throw new AssemblerPreviewError(`${tags.length} required tags don't fit in ${spec.tagCount}.`);
  }
  if (spec.type === CardType.EVENT && (spec.tags !== undefined || (spec.tagCount ?? 0) >= 4)) {
    throw new AssemblerPreviewError('Events can\'t take required tags or 4 tags.');
  }

  const cleaned = Object.fromEntries(Object.entries(spec).filter(([, v]) => v !== undefined)) as AssembleSpec;
  return {
    count: integer(params, 'count', 1, LIMITS.MAX_COUNT) ?? LIMITS.DEFAULT_COUNT,
    seed: integer(params, 'seed', 1, LIMITS.MAX_SEED) ?? randomSeed(),
    spec: cleaned,
  };
}

/**
 * Generates cards for the generator page. Nothing is registered or saved: the cards exist only
 * in the response. The same request (seed included) always gives the same cards.
 */
export function previewCards(request: AssemblerPreviewRequest): AssemblerPreviewResponse {
  const rng = new SeededRandom(request.seed / (LIMITS.MAX_SEED + 1));
  const generator = new AssemblerGenerator(rng);
  const cards: Array<CardModel> = [];
  let failed = 0;
  for (let i = 1; i <= request.count; i++) {
    // Four misses before any card worked: the options are (nearly) impossible; don't grind on.
    if (failed >= 4 && cards.length === 0) {
      failed = request.count - cards.length;
      break;
    }
    const complexity = request.spec.complexity ?? AssemblerExpansion.pickComplexity(rng);
    const name = `Assembled preview-${request.seed}-${i}`;
    let definition;
    try {
      definition = generator.generate(name, complexity, request.spec);
    } catch (e) {
      // Some combinations rarely fit on a card, e.g. high complexity at the top of the cost range.
      failed++;
      continue;
    }
    const card = newAssembledCard(definition);
    // Card caches properties by name; this card is gone after the response.
    forgetCardProperties(name as CardName);
    const model: CardModel = {name: card.name, calculatedCost: card.cost};
    addAssembledCardModel(model, card, definition);
    cards.push(model);
  }
  if (cards.length === 0) {
    throw new AssemblerPreviewError('No card fits these options. Try loosening them, e.g. a wider cost range, a lower complexity or fewer guaranteed effects.');
  }
  return failed > 0 ? {seed: request.seed, cards, failed} : {seed: request.seed, cards};
}
