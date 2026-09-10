import {expect} from 'chai';
import {StolenBlueprints} from '@/server/cards/blackmarket/StolenBlueprints';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('StolenBlueprints', () => {
  let card: StolenBlueprints;
  let player: TestPlayer;

  beforeEach(() => {
    card = new StolenBlueprints();
    [, player] = testGame(2);
  });

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.BUILDING, Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play draws a card', () => {
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(1);
  });
});
