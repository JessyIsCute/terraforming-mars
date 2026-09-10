import {expect} from 'chai';
import {IllicitMiningOp} from '@/server/cards/blackmarket/IllicitMiningOp';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('IllicitMiningOp', () => {
  let card: IllicitMiningOp;
  let player: TestPlayer;

  beforeEach(() => {
    card = new IllicitMiningOp();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({energy: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 2 energy and gains 3 steel', () => {
    player.energy = 2;
    expect(player.steel).to.eq(0);

    card.play(player);

    expect(player.energy).to.eq(0);
    expect(player.steel).to.eq(3);
  });
});
