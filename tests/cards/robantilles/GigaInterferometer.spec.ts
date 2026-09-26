import {expect} from 'chai';
import {GigaInterferometer} from '../../../src/server/cards/robantilles/GigaInterferometer';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Phase} from '../../../src/common/Phase';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {cast} from '../../../src/common/utils/utils';
import {Payment} from '../../../src/common/inputs/Payment';

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

  it('waits for every player before handing the turn to the next player', () => {
    const [game, passedPlayer, actingPlayer, nextPlayer] = testGame(3, {draftVariant: true});
    game.generation = 6;
    game.phase = Phase.ACTION;
    game.activePlayer = actingPlayer;
    game.playerHasPassed(passedPlayer);
    for (const p of game.players) {
      p.megaCredits = 6;
    }
    actingPlayer.actionsTakenThisRound = 2;

    card.play(actingPlayer);
    actingPlayer.takeAction();
    actingPlayer.process({type: 'card', cards: []});

    expect(game.activePlayer).to.eq(actingPlayer);
    expect(actingPlayer.getWaitingFor()).is.undefined;
    expect(nextPlayer.getWaitingFor()).is.instanceOf(SelectCard);

    passedPlayer.process({type: 'card', cards: []});
    expect(game.activePlayer).to.eq(actingPlayer);
    nextPlayer.process({type: 'card', cards: []});

    expect(game.activePlayer).to.eq(nextPlayer);
    expect(nextPlayer.getWaitingFor()).is.instanceOf(OrOptions);
    expect(game.generation).to.eq(6);
    expect(game.phase).to.eq(Phase.ACTION);
    expect(game.hasPassedThisActionPhase(passedPlayer)).is.true;
    expect(game.players.every((p) => !p.awaitingAdHocResearch)).is.true;
  });

  it('resumes the current turn only after the last purchase is paid', () => {
    const game = player.game;
    game.generation = 6;
    game.phase = Phase.ACTION;
    player.actionsTakenThisRound = 1;
    player2.canUseHeatAsMegaCredits = true;
    player2.heat = 3;
    card.play(player);
    player.takeAction();

    const choice = cast(player2.getWaitingFor(), SelectCard);
    expect(choice.cards).has.length(4);
    const boughtCard = choice.cards[0];
    player2.process({type: 'card', cards: [boughtCard.name]});
    expect(player2.getWaitingFor()).is.instanceOf(SelectPayment);

    player.process({type: 'card', cards: []});
    expect(player.getWaitingFor()).is.undefined;
    expect(player.actionsTakenThisRound).to.eq(1);
    expect(player2.cardsInHand).does.not.include(boughtCard);

    player2.process({type: 'payment', payment: Payment.of({heat: 3})});
    expect(player2.cardsInHand).includes(boughtCard);
    expect(player2.heat).to.eq(0);
    expect(player2.megaCredits).to.eq(6);
    expect(player2.getWaitingFor()).is.undefined;
    expect(game.activePlayer).to.eq(player);
    expect(player.actionsTakenThisRound).to.eq(1);
    expect(player.getWaitingFor()).is.instanceOf(OrOptions);
    expect(game.players.every((p) => !p.awaitingAdHocResearch)).is.true;
  });
});
