import {expect} from 'chai';
import {BootlegBattery} from '@/server/cards/blackmarket/BootlegBattery';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BootlegBattery', () => {
  let card: BootlegBattery;
  let player: TestPlayer;

  beforeEach(() => {
    card = new BootlegBattery();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.cost).to.eq(1);
    expect(card.reserveUnits).deep.include({steel: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 2 steel and raises energy production 1 step', () => {
    player.steel = 2;
    expect(player.production.energy).to.eq(0);

    card.play(player);

    expect(player.steel).to.eq(0);
    expect(player.production.energy).to.eq(1);
  });
});
