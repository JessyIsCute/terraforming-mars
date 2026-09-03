import {expect} from 'chai';
import {ChillingRiches} from '../../../src/server/cards/sillyfication/ChillingRiches';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('ChillingRiches', () => {
  let card: ChillingRiches;
  let player: TestPlayer;

  beforeEach(() => {
    card = new ChillingRiches();
    [/* game */, player] = testGame(2);
  });

  it('cannot play without 2 heat production', () => {
    player.production.override({heat: 1});
    expect(card.canPlay(player)).is.false;
  });

  it('trades 2 heat production for 7 M€ production', () => {
    player.production.override({heat: 3});
    card.play(player);
    expect(player.production.heat).to.eq(1);
    expect(player.production.megacredits).to.eq(7);
  });
});
