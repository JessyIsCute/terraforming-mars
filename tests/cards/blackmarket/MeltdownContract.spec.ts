import {expect} from 'chai';
import {MeltdownContract} from '@/server/cards/blackmarket/MeltdownContract';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('MeltdownContract', () => {
  let card: MeltdownContract;
  let player: TestPlayer;

  beforeEach(() => {
    card = new MeltdownContract();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.POWER]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({titanium: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 2 titanium and raises heat production 3 steps', () => {
    player.titanium = 2;
    expect(player.production.heat).to.eq(0);

    card.play(player);

    expect(player.titanium).to.eq(0);
    expect(player.production.heat).to.eq(3);
  });
});
