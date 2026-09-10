import {expect} from 'chai';
import {UndergroundCasino} from '@/server/cards/blackmarket/UndergroundCasino';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UndergroundCasino', () => {
  let card: UndergroundCasino;
  let player: TestPlayer;

  beforeEach(() => {
    card = new UndergroundCasino();
    [, player] = testGame(2);
  });

  it('has the printed stats, including the Crime tag', () => {
    expect(card.tags).deep.eq([Tag.CRIME, Tag.BUILDING]);
    expect(card.cost).to.eq(10);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises M€ production 4 steps', () => {
    expect(player.production.megacredits).to.eq(0);
    card.play(player);
    expect(player.production.megacredits).to.eq(4);
  });
});
