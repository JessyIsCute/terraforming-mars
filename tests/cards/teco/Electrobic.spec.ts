import {expect} from 'chai';
import {Electrobic} from '../../../src/server/cards/teco/Electrobic';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Electrobic', () => {
  let card: Electrobic;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Electrobic();
    [/* game */, player] = testGame(2);
  });

  it('requires 4 plants to play', () => {
    player.plants = 3;
    expect(card.canPlay(player)).is.false;
    player.plants = 4;
    expect(card.canPlay(player)).is.true;
  });

  it('spends 4 plants for 2 energy production', () => {
    player.plants = 4;
    player.production.override({energy: 0});

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.production.energy).to.eq(2);
  });
});
