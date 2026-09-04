import {expect} from 'chai';
import {PreludeGambit} from '../../../src/server/cards/teco/PreludeGambit';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {IPreludeCard} from '../../../src/server/cards/prelude/IPreludeCard';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';

describe('PreludeGambit', () => {
  let card: PreludeGambit;
  let player: TestPlayer;

  beforeEach(() => {
    card = new PreludeGambit();
    [/* game */, player] = testGame(2, {preludeExtension: true});
  });

  it('discards 7 cards and draws 6 preludes, letting you play up to 2', () => {
    const game = player.game;
    player.cardsInHand = [];
    for (let i = 0; i < 12; i++) {
      player.cardsInHand.push({name: `filler-${i}`} as any);
    }

    card.play(player);
    runAllActions(game);

    const discard = cast(player.popWaitingFor(), SelectCard);
    discard.cb(discard.cards.slice(0, 7));
    runAllActions(game);

    const firstPick = cast(player.popWaitingFor(), SelectCard<IPreludeCard>);
    expect(firstPick.cards).has.lengthOf(6);
    const [firstPrelude] = firstPick.cards;
    firstPick.cb([firstPrelude]);
    runAllActions(game);

    expect(player.playedCards.asArray().some((c) => c.name === firstPrelude.name)).is.true;

    const secondPick = cast(player.popWaitingFor(), SelectCard<IPreludeCard>);
    expect(secondPick.cards).has.lengthOf(5);
    secondPick.cb([]);
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
  });
});
