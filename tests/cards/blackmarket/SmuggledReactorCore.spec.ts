import {expect} from 'chai';
import {SmuggledReactorCore} from '@/server/cards/blackmarket/SmuggledReactorCore';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('SmuggledReactorCore', () => {
  let card: SmuggledReactorCore;
  let player: TestPlayer;

  beforeEach(() => {
    card = new SmuggledReactorCore();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.POWER, Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({titanium: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 2 titanium and raises energy production 2 steps', () => {
    player.titanium = 2;
    expect(player.production.energy).to.eq(0);

    card.play(player);

    expect(player.titanium).to.eq(0);
    expect(player.production.energy).to.eq(2);
  });
});
