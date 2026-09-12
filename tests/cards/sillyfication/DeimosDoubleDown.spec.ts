import {expect} from 'chai';
import {DeimosDoubleDown} from '../../../src/server/cards/sillyfication/DeimosDoubleDown';
import {Comet} from '../../../src/server/cards/base/Comet';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {testGame} from '../../TestGame';

describe('DeimosDoubleDown', () => {
  let card: DeimosDoubleDown;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new DeimosDoubleDown();
    [game, player, player2] = testGame(2, {preludeExtension: true});
  });

  it('has a space tag and a "?" in its name', () => {
    expect(card.tags).to.deep.eq([Tag.SPACE]);
    expect(card.name).to.eq('Deimos Double Down?');
  });

  it('gains titanium, draws space events, and copies one to every player', () => {
    player.titanium = 0;
    player.cardsInHand = [];

    card.play(player);
    runAllActions(game);

    expect(player.titanium).to.eq(2);
    const spaceEvents = player.cardsInHand.filter((c) => c.tags.includes(Tag.SPACE));
    expect(spaceEvents.length).to.be.greaterThan(0);
    for (const c of player.cardsInHand) {
      expect(c.type).to.eq('event');
      expect(c.tags).to.contain(Tag.SPACE);
    }
  });

  it('give-away hands every OTHER player a fresh copy of the chosen space event, not the owner', () => {
    player.cardsInHand = [new Comet()];
    player2.cardsInHand = [];

    const selectCard = cast(card.bespokePlay(player), SelectCard);
    selectCard.cb([selectCard.cards[0]]);

    expect(player2.cardsInHand.map((c) => c.name)).to.deep.eq(['Comet']);
    expect(player2.cardsInHand[0]).to.not.eq(player.cardsInHand[0]);
    // The owner keeps just their original - a second copy would be unplayable, since a
    // player can never hold two playable instances of the same-named card.
    expect(player.cardsInHand.filter((c) => c.name === 'Comet')).has.lengthOf(1);
  });
});
