import {expect} from 'chai';
import {GreenhouseLaundering} from '@/server/cards/blackmarket/GreenhouseLaundering';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('GreenhouseLaundering', () => {
  let card: GreenhouseLaundering;
  let player: TestPlayer;

  beforeEach(() => {
    card = new GreenhouseLaundering();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({plants: 6});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 6 plants and gains 8 steel', () => {
    player.plants = 6;
    expect(player.steel).to.eq(0);

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.steel).to.eq(8);
  });
});
