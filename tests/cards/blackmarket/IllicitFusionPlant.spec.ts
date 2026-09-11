import {expect} from 'chai';
import {IllicitFusionPlant} from '@/server/cards/blackmarket/IllicitFusionPlant';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('IllicitFusionPlant', () => {
  let card: IllicitFusionPlant;
  let player: TestPlayer;

  beforeEach(() => {
    card = new IllicitFusionPlant();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({heat: 5});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 5 heat and raises energy production 3 steps', () => {
    player.heat = 5;
    expect(player.production.energy).to.eq(0);

    card.play(player);

    expect(player.heat).to.eq(0);
    expect(player.production.energy).to.eq(3);
  });
});
