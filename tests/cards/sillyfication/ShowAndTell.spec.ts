import {expect} from 'chai';
import {ShowAndTell} from '../../../src/server/cards/sillyfication/ShowAndTell';
import {Ants} from '../../../src/server/cards/base/Ants';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Comet} from '../../../src/server/cards/base/Comet';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('ShowAndTell', () => {
  let card: ShowAndTell;
  let player: TestPlayer;
  let player2: TestPlayer;
  let player3: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new ShowAndTell();
    [game, player, player2, player3] = testGame(3);
    player.cardsInHand = [];
    player2.cardsInHand = [new Ants()];
    player3.cardsInHand = [new Birds(), new Comet()];
  });

  it('cannot be played when no opponent holds a card', () => {
    player2.cardsInHand = [];
    player3.cardsInHand = [];
    expect(card.canPlay(player)).is.false;
  });

  it('each opponent reveals one card and the active player takes one of them', () => {
    card.play(player);
    runAllActions(game);

    cast(player2.popWaitingFor(), SelectCard).cb([player2.cardsInHand[0]]);
    runAllActions(game);
    const p3reveal = cast(player3.popWaitingFor(), SelectCard);
    p3reveal.cb([player3.cardsInHand.find((c) => c.name === 'Birds')!]);
    runAllActions(game);

    const take = cast(player.popWaitingFor(), SelectCard);
    expect(take.cards.map((c) => c.name).sort()).to.deep.eq(['Ants', 'Birds']);
    take.cb([take.cards.find((c) => c.name === 'Birds')!]);
    runAllActions(game);

    expect(player.cardsInHand.map((c) => c.name)).to.deep.eq(['Birds']);
    expect(player3.cardsInHand.map((c) => c.name)).to.deep.eq(['Comet']);
    // The card that was revealed but not taken stays in its owner's hand.
    expect(player2.cardsInHand.map((c) => c.name)).to.deep.eq(['Ants']);
  });
});
