import {expect} from 'chai';
import {Microbitic} from '../../../src/server/cards/teco/Microbitic';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Microbitic', () => {
  let card: Microbitic;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Microbitic();
    [/* game */, player] = testGame(2);
  });

  it('requires 2 plants to play', () => {
    player.plants = 1;
    expect(card.canPlay(player)).is.false;
    player.plants = 2;
    expect(card.canPlay(player)).is.true;
  });

  it('spends 2 plants for 2 plant production', () => {
    player.plants = 2;
    player.production.override({plants: 0});

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.production.plants).to.eq(2);
  });
});
