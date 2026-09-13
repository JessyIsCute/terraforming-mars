import {expect} from 'chai';
import {
  POPULISTS_BONUS_1,
  POPULISTS_POLICY_1,
  POPULISTS_POLICY_3,
  POPULISTS_POLICY_4,
} from '../../../src/server/turmoil/parties/Populists';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {Comet} from '../../../src/server/cards/base/Comet';
import {AICentral} from '../../../src/server/cards/base/AICentral';
import {ImportedNitrogen} from '../../../src/server/cards/base/ImportedNitrogen';
import {CardType} from '../../../src/common/cards/CardType';

describe('Populists', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(1, {turmoilExtension: true, morePartiesExpansion: true});
  });

  it('bonus A: scores and grants 1 M€ per event played', () => {
    expect(POPULISTS_BONUS_1.getScore(player)).to.eq(0);
    player.playedCards.push(new Comet());
    expect(POPULISTS_BONUS_1.getScore(player)).to.eq(1);

    const before = player.megaCredits;
    POPULISTS_BONUS_1.grantForPlayer(player);
    expect(player.megaCredits).to.eq(before + 1);
  });

  it('policy 1: gains twice a played card\'s VP in M€', () => {
    const before = player.megaCredits;
    POPULISTS_POLICY_1.onCardPlayed(player, new AICentral()); // 1 VP
    expect(player.megaCredits).to.eq(before + 2);
  });

  it('policy 1: has no effect for a card worth 0 VP', () => {
    const before = player.megaCredits;
    POPULISTS_POLICY_1.onCardPlayed(player, new ImportedNitrogen());
    expect(player.megaCredits).to.eq(before);
  });

  it('policy 3: draws a card when an Event card is played, not for other types', () => {
    const beforeHand = player.cardsInHand.length;
    POPULISTS_POLICY_3.onCardPlayed(player, new AICentral()); // Automated, not an Event
    expect(player.cardsInHand.length).to.eq(beforeHand);

    POPULISTS_POLICY_3.onCardPlayed(player, new Comet()); // Event
    expect(player.cardsInHand.length).to.eq(beforeHand + 1);
  });

  it('policy 4: pays 4 M€ and draws an Event card', () => {
    player.megaCredits = 10;
    expect(POPULISTS_POLICY_4.canAct(player)).is.true;
    POPULISTS_POLICY_4.action(player);
    game.deferredActions.runAll(() => {});
    expect(player.megaCredits).to.eq(6);
    expect(player.cardsInHand).to.have.lengthOf(1);
    expect(player.cardsInHand[0].type).to.eq(CardType.EVENT);
  });

  it('policy 4 cannot act without enough M€', () => {
    player.megaCredits = 0;
    expect(POPULISTS_POLICY_4.canAct(player)).is.false;
  });
});
