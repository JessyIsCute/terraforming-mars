import {expect} from 'chai';
import {BlacksiteExcavation} from '@/server/cards/blackmarket/BlacksiteExcavation';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BlacksiteExcavation', () => {
  let card: BlacksiteExcavation;
  let player: TestPlayer;

  beforeEach(() => {
    card = new BlacksiteExcavation();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING, Tag.PLANT]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({titanium: 5});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 5 titanium and raises plant and heat production 2 steps each', () => {
    player.titanium = 5;
    expect(player.production.plants).to.eq(0);
    expect(player.production.heat).to.eq(0);

    card.play(player);

    expect(player.titanium).to.eq(0);
    expect(player.production.plants).to.eq(2);
    expect(player.production.heat).to.eq(2);
  });
});
