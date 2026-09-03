import {expect} from 'chai';
import {MusicalChairs} from '../../../src/server/cards/sillyfication/MusicalChairs';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('MusicalChairs', () => {
  let card: MusicalChairs;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MusicalChairs();
    [game, player] = testGame(3);
  });

  it('needs at least 2 players', () => {
    const [/* g */, solo] = testGame(1);
    expect(card.canPlay(solo)).is.false;
  });

  it('hands the first-player marker to a different player', () => {
    const before = game.first;
    card.play(player);
    expect(game.first).to.not.eq(before);
    expect(game.players).to.contain(game.first);
    expect(game.playersInGenerationOrder[0]).to.eq(game.first);
  });
});
