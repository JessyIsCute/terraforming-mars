import {expect} from 'chai';
import {GeothermalKickback} from '@/server/cards/blackmarket/GeothermalKickback';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('GeothermalKickback', () => {
  let card: GeothermalKickback;
  let player: TestPlayer;

  beforeEach(() => {
    card = new GeothermalKickback();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.POWER]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({heat: 5});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 5 heat and raises M€ production 2 steps', () => {
    player.heat = 5;
    expect(player.production.megacredits).to.eq(0);

    card.play(player);

    expect(player.heat).to.eq(0);
    expect(player.production.megacredits).to.eq(2);
  });
});
