import {expect} from 'chai';
import {PharmacyOnLuna} from '../../../src/server/cards/sillyfication/PharmacyOnLuna';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades'; // microbe tag
import {MicroCredits} from '../../../src/server/cards/sillyfication/MicroCredits'; // no tags
import {IGame} from '../../../src/server/IGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('PharmacyOnLuna', () => {
  let card: PharmacyOnLuna;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new PharmacyOnLuna();
    [game, player, player2] = testGame(2, {moonExpansion: true});
    player.playedCards.push(card);
    player.megaCredits = 0;
  });

  it('gains 2 M€ per microbe tag any player plays', () => {
    card.onCardPlayedByAnyPlayer(player, new Tardigrades(), player2);
    expect(player.megaCredits).to.eq(2);
  });

  it('offers to spend 2 M€ to draw when you play a microbe tag', () => {
    player.megaCredits = 5;
    player.cardsInHand = [];

    const options = cast(card.onCardPlayed(player, new Tardigrades()), OrOptions);
    options.options[0].cb();
    runAllActions(game);

    expect(player.megaCredits).to.eq(3);
    expect(player.cardsInHand).to.have.length(1);
  });

  it('no draw option without a microbe tag or enough M€', () => {
    player.megaCredits = 5;
    expect(card.onCardPlayed(player, new MicroCredits())).is.undefined;
    player.megaCredits = 1;
    expect(card.onCardPlayed(player, new Tardigrades())).is.undefined;
  });
});
