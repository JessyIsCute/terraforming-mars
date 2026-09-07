import {CardComponent} from '@/common/cards/render/CardComponent';
import {ItemType, isICardRenderItem, isICardRenderProductionBox} from '@/common/cards/render/Types';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {MutationEffect} from '@/common/mutationmarkets/MutationEffect';
import {Resource} from '@/common/Resource';

export type ResourceGrantEffect = Extract<MutationEffect, {resource: Resource}>;

const RESOURCE_TO_RENDER_ITEM_TYPE: Record<Resource, CardRenderItemType> = {
  [Resource.MEGACREDITS]: CardRenderItemType.MEGACREDITS,
  [Resource.STEEL]: CardRenderItemType.STEEL,
  [Resource.TITANIUM]: CardRenderItemType.TITANIUM,
  [Resource.PLANTS]: CardRenderItemType.PLANTS,
  [Resource.ENERGY]: CardRenderItemType.ENERGY,
  [Resource.HEAT]: CardRenderItemType.HEAT,
};

type BoxComponent = CardComponent & {rows: Array<Array<ItemType>>};

// root / production-box / effect / corp-box-effect / corp-box-action /
// corp-box-effect-action all share this shape; item/symbol/tile don't.
function hasRows(item: CardComponent): item is BoxComponent {
  return 'rows' in item;
}

/**
 * Tries to fold a `grantResourceOnPlay`/`grantProductionOnPlay` mutation effect into a
 * matching icon the card already shows in its own description (e.g. a card that already
 * grants +1 plant on play gets that "1" bumped to "3" instead of a separate "Gain 2
 * Plants on play" line) -- bumping the matched icon's amount and marking it to glow, in a
 * freshly cloned copy of `renderData`. The shared, cached-per-card-class renderData object
 * is never mutated in place.
 *
 * A production grant only matches an icon already inside a production-box (a per-
 * generation production change); a one-time resource grant only matches one that isn't.
 * Returns undefined if nothing matches, so the caller falls back to a plain description
 * line instead.
 */
export function mergeMutationGrantIntoRenderData(renderData: CardComponent | undefined, effect: ResourceGrantEffect): CardComponent | undefined {
  if (renderData === undefined || !hasRows(renderData)) {
    return undefined;
  }
  const wantType = RESOURCE_TO_RENDER_ITEM_TYPE[effect.resource];
  const wantProduction = effect.kind === 'grantProductionOnPlay';

  const clone = cloneItemType(renderData) as BoxComponent;
  const matched = bumpFirstMatchInRows(clone.rows, false, wantType, wantProduction, effect.amount);
  return matched ? clone : undefined;
}

function cloneItemType(item: ItemType): ItemType {
  if (item === undefined || typeof item === 'string') {
    return item;
  }
  if (hasRows(item)) {
    const cloned: BoxComponent = {...item, rows: item.rows.map((row) => row.map(cloneItemType))};
    return cloned;
  }
  return {...item};
}

function bumpFirstMatchInRows(rows: Array<Array<ItemType>>, insideProductionBox: boolean, wantType: CardRenderItemType, wantProduction: boolean, amount: number): boolean {
  for (const row of rows) {
    for (const item of row) {
      if (bumpIfMatch(item, insideProductionBox, wantType, wantProduction, amount)) {
        return true;
      }
    }
  }
  return false;
}

function bumpIfMatch(item: ItemType, insideProductionBox: boolean, wantType: CardRenderItemType, wantProduction: boolean, amount: number): boolean {
  if (item === undefined || typeof item === 'string') {
    return false;
  }
  if (isICardRenderItem(item)) {
    if (item.type === wantType && insideProductionBox === wantProduction) {
      item.amount += amount;
      item.mutationGlow = true;
      return true;
    }
    return false;
  }
  if (isICardRenderProductionBox(item)) {
    return bumpFirstMatchInRows(item.rows, true, wantType, wantProduction, amount);
  }
  if (hasRows(item)) {
    return bumpFirstMatchInRows(item.rows, insideProductionBox, wantType, wantProduction, amount);
  }
  return false;
}
