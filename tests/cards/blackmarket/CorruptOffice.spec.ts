import {expect} from 'chai';
import {CorruptOffice} from '@/server/cards/blackmarket/CorruptOffice';
import {UndergroundCasino} from '@/server/cards/blackmarket/UndergroundCasino';
import {ClassifiedResearch} from '@/server/cards/blackmarket/ClassifiedResearch';
import {testGame} from '../../TestGame';

describe('CorruptOffice', () => {
  it('discounts Crime-tagged cards by 2 M€, and leaves non-Crime cards alone', () => {
    const card = new CorruptOffice();
    const crimeCard = new UndergroundCasino();
    const nonCrimeCard = new ClassifiedResearch();
    const [, player] = testGame(2);

    expect(card.getCardDiscount(player, crimeCard)).to.eq(2);
    expect(card.getCardDiscount(player, nonCrimeCard)).to.eq(0);
  });
});
