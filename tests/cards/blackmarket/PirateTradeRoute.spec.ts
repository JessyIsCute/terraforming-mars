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

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.SPACE]);
    expect(card.cost).to.eq(0);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play gains 5 M€', () => {
    const before = player.megaCredits;
    card.play(player);
    expect(player.megaCredits).to.eq(before + 5);
  });
});
