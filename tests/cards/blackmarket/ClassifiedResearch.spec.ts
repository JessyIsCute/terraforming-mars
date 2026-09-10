import {expect} from 'chai';
import {ClassifiedResearch, ClassifiedResearchII, CLASSIFIED_RESEARCH_MIN_COST, CLASSIFIED_RESEARCH_MAX_COST} from '@/server/cards/blackmarket/ClassifiedResearch';
import {CardName} from '@/common/cards/CardName';
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

  it('defaults to the minimum listed price, and a rolled price bypasses the shared properties cache', () => {
    expect(card.cost).to.eq(CLASSIFIED_RESEARCH_MIN_COST);
    expect(new ClassifiedResearch(CardName.CLASSIFIED_RESEARCH, CLASSIFIED_RESEARCH_MAX_COST).cost).to.eq(CLASSIFIED_RESEARCH_MAX_COST);
  });

  it('has the printed tag and VP', () => {
    expect(card.tags).deep.eq([Tag.SCIENCE, Tag.SCIENCE]);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play draws a card', () => {
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(1);
  });

  it('the II printing is a distinct CardName sharing the same behavior', () => {
    const printing = new ClassifiedResearchII();
    expect(printing.name).to.not.eq(CardName.CLASSIFIED_RESEARCH);
    expect(printing.cost).to.eq(CLASSIFIED_RESEARCH_MIN_COST);
    expect(printing.tags).deep.eq([Tag.SCIENCE, Tag.SCIENCE]);
  });
});
