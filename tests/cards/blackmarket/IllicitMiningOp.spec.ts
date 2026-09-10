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

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play gains 3 steel', () => {
    expect(player.steel).to.eq(0);
    card.play(player);
    expect(player.steel).to.eq(3);
  });
});
