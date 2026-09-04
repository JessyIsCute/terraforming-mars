import {expect} from 'chai';
import {Critterworld} from '../../../src/server/cards/sillyfication/Critterworld';
import {Fish} from '../../../src/server/cards/base/Fish';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';

describe('Critterworld', () => {
  let card: Critterworld;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new Critterworld();
    [game, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('starts with 8 animals', () => {
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).to.eq(8);
  });

  it('mirrors animals added to another card', () => {
    const fish = new Fish();
    player.playedCards.push(fish);

    player.addResourceTo(fish, 2);

    expect(card.resourceCount).to.eq(2);
  });

  it('does not mirror animals added to itself', () => {
    player.addResourceTo(card, 3);
    expect(card.resourceCount).to.eq(3);
  });

  it('initial action draws 2 animal-tag cards', () => {
    player.cardsInHand = [];
    player.defer(card.initialAction(player));
    runAllActions(game);
    expect(player.cardsInHand).to.have.length(2);
    expect(player.cardsInHand.every((c) => c.tags.includes('animal' as any))).is.true;
  });

  it('action removes 1 animal and pays 1 M€ per 2 animals', () => {
    player.addResourceTo(card, 5);
    player.megaCredits = 0;

    expect(card.canAct()).is.true;
    card.action(player);
    runAllActions(game);

    expect(card.resourceCount).to.eq(4);
    expect(player.megaCredits).to.eq(2); // floor(5 / 2)
  });

  it('scores 1 VP per 4 animals', () => {
    player.addResourceTo(card, 9);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });
});
