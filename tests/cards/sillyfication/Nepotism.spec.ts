import {expect} from 'chai';
import {Nepotism} from '../../../src/server/cards/sillyfication/Nepotism';
import {IGame} from '../../../src/server/IGame';
import {testGame} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';

describe('Nepotism', () => {
  let card: Nepotism;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new Nepotism();
    [game, player] = testGame(2, {turmoilExtension: true});
  });

  it('adds 2 delegates to the reserve (7 -> 9)', () => {
    const turmoil = game.turmoil!;
    expect(turmoil.getAvailableDelegateCount(player)).to.eq(7);

    card.play(player);

    expect(turmoil.getAvailableDelegateCount(player)).to.eq(9);
  });

  it('stacks on repeated plays', () => {
    const turmoil = game.turmoil!;
    card.play(player);
    card.play(player);
    expect(turmoil.getAvailableDelegateCount(player)).to.eq(11);
  });
});
