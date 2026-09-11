import {expect} from 'chai';
import {OreForOxygenRacket} from '@/server/cards/blackmarket/OreForOxygenRacket';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('OreForOxygenRacket', () => {
  let card: OreForOxygenRacket;
  let player: TestPlayer;

  beforeEach(() => {
    card = new OreForOxygenRacket();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.PLANT]);
    expect(card.cost).to.eq(1);
    expect(card.reserveUnits).deep.include({steel: 3});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 3 steel and raises plant production 2 steps', () => {
    player.steel = 3;
    expect(player.production.plants).to.eq(0);

    card.play(player);

    expect(player.steel).to.eq(0);
    expect(player.production.plants).to.eq(2);
  });
});
