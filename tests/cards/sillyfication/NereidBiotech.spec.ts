import {expect} from 'chai';
import {NereidBiotech} from '../../../src/server/cards/sillyfication/NereidBiotech';
import {GanymedeColony} from '../../../src/server/cards/base/GanymedeColony';
import {MicroCredits} from '../../../src/server/cards/sillyfication/MicroCredits';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Ants} from '../../../src/server/cards/base/Ants';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';

describe('NereidBiotech', () => {
  let card: NereidBiotech;
  let player: TestPlayer;

  beforeEach(() => {
    card = new NereidBiotech();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('has a Jovian tag and a Microbe tag', () => {
    expect(card.tags).to.deep.eq(['jovian', 'microbe']);
  });

  it('starts with 38 M€', () => {
    expect(card.startingMegaCredits).to.eq(38);
  });

  it('adds a microbe to any card and gains 1 M€ when a Jovian tag is played, including its own', () => {
    player.megaCredits = 0;

    card.onCardPlayed(player, card);
    runAllActions(player.game);

    // Card only holds microbes itself so far, so it auto-selects as the target.
    expect(card.resourceCount).to.eq(1);
    expect(player.megaCredits).to.eq(1);
  });

  it('does not trigger for a card without a Jovian tag', () => {
    player.megaCredits = 0;

    card.onCardPlayed(player, new MicroCredits());
    runAllActions(player.game);

    expect(card.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(0);
  });

  it('does not gain M€ for a resource added that is not a microbe', () => {
    const fish = new Fish();
    player.playedCards.push(fish);
    player.megaCredits = 0;

    player.addResourceTo(fish, 2);

    expect(player.megaCredits).to.eq(0);
  });

  it('lets you choose a different microbe card as the target when more than one exists', () => {
    const ants = new Ants();
    player.playedCards.push(ants);
    player.megaCredits = 0;

    // Ganymede Colony has a single Jovian tag.
    card.onCardPlayed(player, new GanymedeColony());
    runAllActions(player.game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    selectCard.cb([ants]);
    runAllActions(player.game);

    expect(ants.resourceCount).to.eq(1);
    expect(card.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(1);
  });

  it('scores 1 VP per 3 microbes on this card', () => {
    player.addResourceTo(card, 7);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });
});
