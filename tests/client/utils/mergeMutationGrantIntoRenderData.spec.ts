import {expect} from 'chai';
import {mergeMutationGrantIntoRenderData, ResourceGrantEffect} from '@/client/utils/mergeMutationGrantIntoRenderData';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {ICardRenderItem, ICardRenderRoot} from '@/common/cards/render/Types';
import {Resource} from '@/common/Resource';

function plantsItem(amount: number): ICardRenderItem {
  return {is: 'item', type: CardRenderItemType.PLANTS, amount};
}
function heatItem(amount: number): ICardRenderItem {
  return {is: 'item', type: CardRenderItemType.HEAT, amount};
}

const grantPlants: ResourceGrantEffect = {kind: 'grantResourceOnPlay', resource: Resource.PLANTS, amount: 2};
const grantHeatProduction: ResourceGrantEffect = {kind: 'grantProductionOnPlay', resource: Resource.HEAT, amount: 1};

describe('mergeMutationGrantIntoRenderData', () => {
  it('bumps a matching plain item and marks it to glow, for a one-time resource grant', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[plantsItem(1)]]};

    const merged = mergeMutationGrantIntoRenderData(root, grantPlants) as ICardRenderRoot;

    expect(merged).is.not.undefined;
    const item = merged.rows[0][0] as ICardRenderItem;
    expect(item.amount).to.eq(3); // 1 + 2
    expect(item.mutationGlow).to.eq(true);
  });

  it('does not mutate the original renderData object', () => {
    const original: ICardRenderRoot = {is: 'root', rows: [[plantsItem(1)]]};

    mergeMutationGrantIntoRenderData(original, grantPlants);

    const originalItem = original.rows[0][0] as ICardRenderItem;
    expect(originalItem.amount).to.eq(1);
    expect(originalItem.mutationGlow).is.undefined;
  });

  it('does not match a plain item for a different resource', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[heatItem(1)]]};

    expect(mergeMutationGrantIntoRenderData(root, grantPlants)).is.undefined;
  });

  it('does not match a plain (non-production) item against a production grant', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[heatItem(1)]]};

    expect(mergeMutationGrantIntoRenderData(root, grantHeatProduction)).is.undefined;
  });

  it('matches a production grant only against an item inside a production-box', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[{is: 'production-box', rows: [[heatItem(1)]]}]]};

    const merged = mergeMutationGrantIntoRenderData(root, grantHeatProduction) as ICardRenderRoot;

    expect(merged).is.not.undefined;
    const box = merged.rows[0][0] as {rows: Array<Array<ICardRenderItem>>};
    expect(box.rows[0][0].amount).to.eq(2); // 1 + 1
    expect(box.rows[0][0].mutationGlow).to.eq(true);
  });

  it('does not match a one-time resource grant against an item inside a production-box', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[{is: 'production-box', rows: [[plantsItem(1)]]}]]};

    expect(mergeMutationGrantIntoRenderData(root, grantPlants)).is.undefined;
  });

  it('finds a matching item nested inside an effect box', () => {
    const root: ICardRenderRoot = {is: 'root', rows: [[{is: 'effect', rows: [[plantsItem(1)]]}]]};

    const merged = mergeMutationGrantIntoRenderData(root, grantPlants) as ICardRenderRoot;

    const effectBox = merged.rows[0][0] as {rows: Array<Array<ICardRenderItem>>};
    expect(effectBox.rows[0][0].amount).to.eq(3);
  });

  it('returns undefined when renderData is undefined', () => {
    expect(mergeMutationGrantIntoRenderData(undefined, grantPlants)).is.undefined;
  });

  it('returns undefined for renderData with no rows (e.g. a bare item)', () => {
    expect(mergeMutationGrantIntoRenderData(plantsItem(1), grantPlants)).is.undefined;
  });
});
