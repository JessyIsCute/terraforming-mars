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
    player.playedCards.push(card);
  });

  it('scores 1 VP', () => {
    expect(card.getVictoryPoints(player)).to.eq(1);
  });

  it('cannot act without energy', () => {
    player.energy = 0;
    expect(card.canAct(player)).is.false;
    player.energy = 1;
    expect(card.canAct(player)).is.true;
  });

  it('cannot act in a solo game', () => {
    const [/* g */, solo] = testGame(1);
    solo.energy = 5;
    expect(card.canAct(solo)).is.false;
  });

  it('spends 1 energy and hands the first-player marker to a different player', () => {
    player.energy = 2;
    const before = game.first;

    card.action(player);

    expect(player.energy).to.eq(1);
    expect(game.first).to.not.eq(before);
    expect(game.playersInGenerationOrder[0]).to.eq(game.first);
  });
});
