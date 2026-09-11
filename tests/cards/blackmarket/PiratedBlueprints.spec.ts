import {expect} from 'chai';
import {PiratedBlueprints} from '@/server/cards/blackmarket/PiratedBlueprints';
import {IllicitMiningOp} from '@/server/cards/blackmarket/IllicitMiningOp';
import {ClassifiedResearch} from '@/server/cards/blackmarket/ClassifiedResearch';
import {testGame} from '../../TestGame';

describe('PiratedBlueprints', () => {
  it('discounts Building-tagged cards by 1 M€, and leaves non-Building cards alone', () => {
    const card = new PiratedBlueprints();
    const buildingCard = new IllicitMiningOp();
    const nonBuildingCard = new ClassifiedResearch();
    const [, player] = testGame(2);

    expect(card.getCardDiscount(player, buildingCard)).to.eq(1);
    expect(card.getCardDiscount(player, nonBuildingCard)).to.eq(0);
  });
});
