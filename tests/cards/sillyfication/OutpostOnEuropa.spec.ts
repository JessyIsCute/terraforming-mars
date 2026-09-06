import {expect} from 'chai';
import {runAllActions, fakeCard} from '../../TestingUtils';
import {RegolithEaters} from '../../../src/server/cards/base/RegolithEaters';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {ICard} from '../../../src/server/cards/ICard';
import {OutpostOnEuropa} from '../../../src/server/cards/sillyfication/OutpostOnEuropa';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {Tag} from '../../../src/common/cards/Tag';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('OutpostOnEuropa', () => {
  let card: OutpostOnEuropa;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new OutpostOnEuropa();
    [game, player, player2] = testGame(2);
  });

  it('has a Jovian tag and three Microbe tags', () => {
    expect(card.tags).to.deep.eq([Tag.JOVIAN, Tag.MICROBE, Tag.MICROBE, Tag.MICROBE]);
  });

  it('requires 1 Microbe tag', () => {
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.MICROBE]}));
    expect(card.canPlay(player)).is.true;
  });

  it('counts Jovian tags across all players, including its own', () => {
    player.playedCards.push(fakeCard({tags: [Tag.MICROBE, Tag.JOVIAN]}));
    player2.playedCards.push(fakeCard({tags: [Tag.JOVIAN, Tag.JOVIAN]}));
    const microbeCard = new RegolithEaters();
    player.playedCards.push(microbeCard);

    cast(card.play(player), undefined);
    runAllActions(game);

    // Only one eligible microbe-resource card, so it's auto-selected: 1 (this card) +
    // 1 (player's own other Jovian card) + 2 (player2's) = 4.
    expect(microbeCard.resourceCount).to.eq(4);
  });

  it('offers a choice among multiple microbe-resource cards', () => {
    const microbeCard1 = new RegolithEaters();
    const microbeCard2 = new Tardigrades();
    player.playedCards.push(microbeCard1, microbeCard2);

    cast(card.play(player), undefined);
    runAllActions(game);

    const action = cast(player.popWaitingFor(), SelectCard<ICard>);
    action.cb([microbeCard2]);

    // 1 Jovian tag total (this card only) added to the chosen card.
    expect(microbeCard2.resourceCount).to.eq(1);
    expect(microbeCard1.resourceCount).to.eq(0);
  });

  it('is worth 2 VP', () => {
    expect(card.getVictoryPoints(player)).to.eq(2);
  });

  it('costs 23 M€', () => {
    expect(card.cost).to.eq(23);
  });
});
