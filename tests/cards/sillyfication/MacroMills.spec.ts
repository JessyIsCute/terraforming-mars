import {expect} from 'chai';
import {MacroMills} from '../../../src/server/cards/sillyfication/MacroMills';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('MacroMills', () => {
  let card: MacroMills;
  let player: TestPlayer;

  beforeEach(() => {
    card = new MacroMills();
    [/* game */, player] = testGame(2);
  });

  it('raises heat production 2 steps', () => {
    card.play(player);
    expect(player.production.heat).to.eq(2);
  });
});
