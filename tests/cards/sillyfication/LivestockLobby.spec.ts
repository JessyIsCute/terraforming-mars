import {expect} from 'chai';
import {LivestockLobby} from '../../../src/server/cards/sillyfication/LivestockLobby';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('LivestockLobby', () => {
  let card: LivestockLobby;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new LivestockLobby();
    [/* game */, player, player2] = testGame(2);
    player.playedCards.push(card);
    player.plants = 0;
    player2.megaCredits = 0;
  });

  it('when any player adds an animal, that player gains M€ and the owner gains plants', () => {
    const fish = new Fish();
    player2.playedCards.push(fish);

    player2.addResourceTo(fish, 2);

    expect(player2.megaCredits).to.eq(2);
    expect(player.plants).to.eq(2);
  });

  it('the owner adding animals also triggers it', () => {
    const fish = new Fish();
    player.playedCards.push(fish);
    player.megaCredits = 0;

    player.addResourceTo(fish, 1);

    expect(player.megaCredits).to.eq(1);
    expect(player.plants).to.eq(1);
  });

  it('ignores non-animal resources', () => {
    const microbeCard = new Tardigrades();
    player.playedCards.push(microbeCard);

    player2.addResourceTo(microbeCard, 3);

    expect(player2.megaCredits).to.eq(0);
    expect(player.plants).to.eq(0);
  });
});
