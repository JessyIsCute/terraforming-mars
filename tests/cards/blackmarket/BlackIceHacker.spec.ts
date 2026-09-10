import {expect} from 'chai';
import {BlackIceHacker} from '@/server/cards/blackmarket/BlackIceHacker';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BlackIceHacker', () => {
  let card: BlackIceHacker;
  let player: TestPlayer;

  beforeEach(() => {
    card = new BlackIceHacker();
    [, player] = testGame(2);
  });

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.SCIENCE]);
    expect(card.cost).to.eq(0);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play draws a card and gains 2 M€', () => {
    const beforeMc = player.megaCredits;
    expect(player.cardsInHand).has.lengthOf(0);

    card.play(player);

    expect(player.cardsInHand).has.lengthOf(1);
    expect(player.megaCredits).to.eq(beforeMc + 2);
  });
});
