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

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.SCIENCE]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({energy: 3});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 3 energy, draws a card, and gains 2 M€', () => {
    player.energy = 3;
    const beforeMc = player.megaCredits;
    expect(player.cardsInHand).has.lengthOf(0);

    card.play(player);

    expect(player.energy).to.eq(0);
    expect(player.cardsInHand).has.lengthOf(1);
    expect(player.megaCredits).to.eq(beforeMc + 2);
  });
});
