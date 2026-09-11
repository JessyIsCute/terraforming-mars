import {expect} from 'chai';
import {VentTapSyndicate} from '@/server/cards/blackmarket/VentTapSyndicate';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('VentTapSyndicate', () => {
  let card: VentTapSyndicate;
  let player: TestPlayer;

  beforeEach(() => {
    card = new VentTapSyndicate();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.POWER]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({heat: 7});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 7 heat and raises M€ production 3 steps', () => {
    player.heat = 7;
    expect(player.production.megacredits).to.eq(0);

    card.play(player);

    expect(player.heat).to.eq(0);
    expect(player.production.megacredits).to.eq(3);
  });
});
