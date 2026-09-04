import {expect} from 'chai';
import {Cats} from '../../../src/server/cards/teco/Cats';
import {Birds} from '../../../src/server/cards/base/Birds';
import {TileType} from '../../../src/common/TileType';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
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

  it('gains an animal on any city placement, with an optional steal from prey cards', () => {
    const birds = new Birds();
    player2.playedCards.push(birds);
    player2.addResourceTo(birds, 3);

    const game = player.game;
    const space = game.board.getAvailableSpacesForCity(player2)[0];
    game.addCity(player2, space);
    runAllActions(game);

    expect(card.resourceCount).to.eq(1);
    expect(space.tile?.tileType).to.eq(TileType.CITY);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    const selectCard = cast(orOptions.options[0], SelectCard);
    selectCard.cb([birds]);
    expect(birds.resourceCount).to.eq(2);
  });

  it('still gains an animal when no prey card is in play', () => {
    const game = player.game;
    const space = game.board.getAvailableSpacesForCity(player)[0];
    game.addCity(player, space);
    expect(card.resourceCount).to.eq(1);
  });
});
