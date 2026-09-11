import {expect} from 'chai';
import {ClassifiedResearch, ClassifiedResearchII, ClassifiedResearchIII} from '@/server/cards/blackmarket/ClassifiedResearch';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('ClassifiedResearch', () => {
  let card: ClassifiedResearch;
  let player: TestPlayer;

  beforeEach(() => {
    card = new ClassifiedResearch();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.SCIENCE, Tag.SCIENCE]);
    expect(card.cost).to.eq(7);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play draws a card', () => {
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(1);
  });

  it('printings II and III are distinct CardNames with an escalating price', () => {
    const printings = [card, new ClassifiedResearchII(), new ClassifiedResearchIII()];
    expect(new Set(printings.map((c) => c.name)).size).to.eq(3);
    expect(printings.map((c) => c.cost)).deep.eq([7, 8, 9]);
    for (const printing of printings) {
      expect(printing.tags).deep.eq([Tag.SCIENCE, Tag.SCIENCE]);
    }
  });
});
