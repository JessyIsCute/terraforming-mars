import {expect} from 'chai';
import {Cats} from '../../../src/server/cards/teco/Cats';
import {Birds} from '../../../src/server/cards/base/Birds';
import {TileType} from '../../../src/common/TileType';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';

describe('Cats', () => {
  let card: Cats;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new Cats();
    [/* game */, player, player2] = testGame(2);
    player.playedCards.push(card);
  });

  it('starts with 1 animal on play', () => {
    card.bespokePlay(player);
    expect(card.resourceCount).to.eq(1);
  });

  it('steals an animal from the only eligible card when a city tile is placed', () => {
    const birds = new Birds();
    player2.playedCards.push(birds);
    player2.addResourceTo(birds, 3);

    const game = player.game;
    const space = game.board.getAvailableSpacesForCity(player2)[0];
    game.addCity(player2, space);
    runAllActions(game);

    expect(space.tile?.tileType).to.eq(TileType.CITY);
    expect(birds.resourceCount).to.eq(2);
    expect(card.resourceCount).to.eq(1);
  });

  it('offers a choice when more than one card could be stolen from', () => {
    const birds = new Birds();
    player2.playedCards.push(birds);
    player2.addResourceTo(birds, 3);
    // Cats itself already holds an animal, so it's a second eligible target.
    player.addResourceTo(card, 1);

    const game = player.game;
    const space = game.board.getAvailableSpacesForCity(player)[0];
    game.addCity(player, space);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).to.have.length(2);
    selectCard.cb([birds]);
    runAllActions(game);

    expect(birds.resourceCount).to.eq(2);
    expect(card.resourceCount).to.eq(2);
  });

  it('gains an animal directly when no player has any animal resource to steal', () => {
    const game = player.game;
    const space = game.board.getAvailableSpacesForCity(player)[0];
    game.addCity(player, space);
    runAllActions(game);
    expect(card.resourceCount).to.eq(1);
  });
});
