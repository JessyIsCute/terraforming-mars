import {expect} from 'chai';
import {ShellCompany} from '@/server/cards/blackmarket/ShellCompany';
import {RogueTerraformingCartel} from '@/server/cards/blackmarket/RogueTerraformingCartel';
import {ClassifiedResearch} from '@/server/cards/blackmarket/ClassifiedResearch';
import {testGame} from '../../TestGame';

describe('ShellCompany', () => {
  it('discounts Earth-tagged cards by 1 M€, and leaves non-Earth cards alone', () => {
    const card = new ShellCompany();
    const earthCard = new RogueTerraformingCartel();
    const nonEarthCard = new ClassifiedResearch();
    const [, player] = testGame(2);

    expect(card.getCardDiscount(player, earthCard)).to.eq(1);
    expect(card.getCardDiscount(player, nonEarthCard)).to.eq(0);
  });
});
