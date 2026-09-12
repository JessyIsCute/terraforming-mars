import {expect} from 'chai';
import {GigaInterferometer} from '../../../src/server/cards/robantilles/GigaInterferometer';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {doWait, runAllActions} from '../../TestingUtils';

describe('GigaInterferometer', () => {
  let card: GigaInterferometer;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new GigaInterferometer();
    [/* game */, player, player2] = testGame(2);
    player.megaCredits = 6;
    player2.megaCredits = 6;
  });

  it('cannot play unless every player has at least 6 M€', () => {
    player2.megaCredits = 5;
    expect(card.canPlay(player)).is.not.true;
  });

  it('can play when every player has at least 6 M€', () => {
    expect(card.canPlay(player)).is.true;
  });

  it('immediately gives every player a drafted-card selection, and resumes the acting player\'s turn once everyone answers', () => {
    card.play(player);
    runAllActions(player.game);

    expect(player.awaitingAdHocResearch).is.true;
    expect(player2.awaitingAdHocResearch).is.true;

    const player1CardsBefore = player.cardsInHand.length;
    const player2CardsBefore = player2.cardsInHand.length;

    // Both players buy nothing, just to close out the ad hoc research quickly.
    doWait(player2, SelectCard, (sc) => sc.cb([]));
    runAllActions(player.game);
    expect(player2.awaitingAdHocResearch).is.false;

    doWait(player, SelectCard, (sc) => sc.cb([]));
    runAllActions(player.game);
    expect(player.awaitingAdHocResearch).is.false;

    expect(player.cardsInHand.length).to.eq(player1CardsBefore);
    expect(player2.cardsInHand.length).to.eq(player2CardsBefore);

    // The acting player's turn resumed: they have a normal action prompt again.
    expect(player.getWaitingFor()).is.not.undefined;
  });
});
