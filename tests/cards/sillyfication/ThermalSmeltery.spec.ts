import {expect} from 'chai';
import {ThermalSmeltery} from '../../../src/server/cards/sillyfication/ThermalSmeltery';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';

describe('ThermalSmeltery', () => {
  let card: ThermalSmeltery;
  let player: TestPlayer;

  beforeEach(() => {
    card = new ThermalSmeltery();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('cannot act without 7 heat', () => {
    player.heat = 6;
    expect(card.canAct(player)).is.false;
    player.heat = 7;
    expect(card.canAct(player)).is.true;
  });

  it('spends 7 heat for 4 titanium', () => {
    player.heat = 7;
    card.action(player);
    runAllActions(player.game);
    expect(player.heat).to.eq(0);
    expect(player.titanium).to.eq(4);
  });
});
