import {expect} from 'chai';
import {MarketCrash} from '../../../src/server/cards/teco/MarketCrash';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('MarketCrash', () => {
  let card: MarketCrash;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new MarketCrash();
    [/* game */, player, player2] = testGame(2, {preludeExtension: true});
  });

  it('has a crime tag', () => {
    expect(card.tags).to.deep.eq([Tag.CRIME]);
  });

  it('drops every player\'s TR by 2, and gives you 3 M€ production and 8 M€', () => {
    const trBefore = player.terraformRating;
    const tr2Before = player2.terraformRating;
    player.megaCredits = 0;

    card.play(player);

    expect(player.terraformRating).to.eq(trBefore - 2);
    expect(player2.terraformRating).to.eq(tr2Before - 2);
    expect(player.production.megacredits).to.eq(3);
    expect(player.megaCredits).to.eq(8);
  });
});
