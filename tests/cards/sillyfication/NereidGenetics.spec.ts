import {expect} from 'chai';
import {NereidGenetics} from '../../../src/server/cards/sillyfication/NereidGenetics';
import {GanymedeColony} from '../../../src/server/cards/base/GanymedeColony';
import {Ants} from '../../../src/server/cards/base/Ants';
import {MicroCredits} from '../../../src/server/cards/sillyfication/MicroCredits';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('NereidGenetics', () => {
  let card: NereidGenetics;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new NereidGenetics();
    [/* game */, player, player2] = testGame(2);
    player.playedCards.push(card);
  });

  it('has a Jovian tag and a Microbe tag', () => {
    expect(card.tags).to.deep.eq([Tag.JOVIAN, Tag.MICROBE]);
  });

  it('starts with 38 M€', () => {
    expect(card.startingMegaCredits).to.eq(38);
  });

  it('counts Jovian tags as microbe tags for tag totals', () => {
    player.tagsForTest = {jovian: 2, microbe: 1};
    // 1 real microbe tag + 2 substituted from Jovian.
    expect(player.tags.count(Tag.MICROBE)).to.eq(3);
  });

  it('treats a played Jovian-tag card as having a microbe tag', () => {
    expect(player.tags.cardHasTag(new GanymedeColony(), Tag.MICROBE)).is.true;
  });

  it('adds 2 microbes to any card when a Jovian tag is played, including its own', () => {
    player.megaCredits = 0;

    card.onCardPlayed(player, card);
    runAllActions(player.game);

    // Card only holds microbes itself so far, so it auto-selects as the target.
    expect(card.resourceCount).to.eq(2);
  });

  it('does not add microbes for a card without a Jovian tag', () => {
    card.onCardPlayed(player, new MicroCredits());
    runAllActions(player.game);

    expect(card.resourceCount).to.eq(0);
  });

  it('gains 1 M€ per microbe tag when you play a card with a microbe tag', () => {
    player.megaCredits = 0;

    player.playCard(new Ants());

    expect(player.megaCredits).to.eq(1);
  });

  it('gains M€ when ANY OTHER player plays a card with a microbe tag', () => {
    player.megaCredits = 0;

    player2.playCard(new Ants());

    expect(player.megaCredits).to.eq(1);
  });

  it('does not gain M€ for a card without a microbe tag', () => {
    player.megaCredits = 0;

    card.onCardPlayedByAnyPlayer(player, new GanymedeColony());

    expect(player.megaCredits).to.eq(0);
  });

  it('scores 1 VP per 3 microbes on this card', () => {
    player.addResourceTo(card, 7);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });
});
