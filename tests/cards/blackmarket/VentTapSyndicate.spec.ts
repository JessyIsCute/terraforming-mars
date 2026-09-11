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
    expect(card.reserveUnits).deep.include({heat: 4});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 4 heat and gains 14 M€', () => {
    player.heat = 4;
    const before = player.megaCredits;

    card.play(player);

    expect(player.heat).to.eq(0);
    expect(player.megaCredits).to.eq(before + 14);
  });
});
