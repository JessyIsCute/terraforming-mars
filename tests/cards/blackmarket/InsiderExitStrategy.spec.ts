import {expect} from 'chai';
import {InsiderExitStrategy} from '@/server/cards/blackmarket/InsiderExitStrategy';
import {Tag} from '@/common/cards/Tag';
import {CardType} from '@/common/cards/CardType';
import {IGame} from '@/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('InsiderExitStrategy', () => {
  let card: InsiderExitStrategy;
  let game: IGame;
  let player: TestPlayer;
  let otherPlayer: TestPlayer;

  beforeEach(() => {
    card = new InsiderExitStrategy();
    [game, player, otherPlayer] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).deep.eq([Tag.EARTH]);
    expect(card.cost).to.eq(6);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('can act only while no other player has passed', () => {
    expect(card.canAct(player)).is.true;

    otherPlayer.pass();
    expect(card.canAct(player)).is.false;
  });

  it('action gains 2 M€ and 2 plants, then passes', () => {
    const beforeMc = player.megaCredits;
    expect(player.plants).to.eq(0);
    expect(game.hasPassedThisActionPhase(player)).is.false;

    card.action(player);

    expect(player.megaCredits).to.eq(beforeMc + 2);
    expect(player.plants).to.eq(2);
    expect(game.hasPassedThisActionPhase(player)).is.true;
  });
});
