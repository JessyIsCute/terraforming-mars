import {expect} from 'chai';
import {RogueAiContract} from '@/server/cards/blackmarket/RogueAiContract';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('RogueAiContract', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('has no printed price -- the market owns it', () => {
    expect(new RogueAiContract().cost).to.eq(0);
  });

  it('has the printed tag and VP', () => {
    const card = new RogueAiContract();
    expect(card.tags).deep.eq([Tag.SCIENCE]);
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play draws 3 cards', () => {
    const card = new RogueAiContract();
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(3);
  });
});
