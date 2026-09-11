import {expect} from 'chai';
import {BlackMarketTerraformer} from '@/server/cards/blackmarket/BlackMarketTerraformer';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BlackMarketTerraformer', () => {
  let card: BlackMarketTerraformer;
  let player: TestPlayer;

  beforeEach(() => {
    card = new BlackMarketTerraformer();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING, Tag.SPACE]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({plants: 5, heat: 3});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 5 plants and 3 heat, and raises titanium and steel production 2 steps each', () => {
    player.plants = 5;
    player.heat = 3;
    expect(player.production.titanium).to.eq(0);
    expect(player.production.steel).to.eq(0);

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.heat).to.eq(0);
    expect(player.production.titanium).to.eq(2);
    expect(player.production.steel).to.eq(2);
  });
});
