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

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.POWER, Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).to.deep.eq({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: 0, heat: 0});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises energy production 2 steps', () => {
    expect(player.production.energy).to.eq(0);
    card.play(player);
    expect(player.production.energy).to.eq(2);
  });
});
