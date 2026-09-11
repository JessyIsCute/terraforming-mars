import {expect} from 'chai';
import {PirateTradeRoute} from '@/server/cards/blackmarket/PirateTradeRoute';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('PirateTradeRoute', () => {
  let card: PirateTradeRoute;
  let player: TestPlayer;

  beforeEach(() => {
    card = new PirateTradeRoute();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.SPACE]);
    expect(card.cost).to.eq(1);
    expect(card.reserveUnits).deep.include({steel: 1, titanium: 1});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 1 steel and 1 titanium and gains 5 M€', () => {
    player.steel = 1;
    player.titanium = 1;
    const before = player.megaCredits;

    card.play(player);

    expect(player.steel).to.eq(0);
    expect(player.titanium).to.eq(0);
    expect(player.megaCredits).to.eq(before + 5);
  });
});
