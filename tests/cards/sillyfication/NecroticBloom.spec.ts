import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {NecroticBloom} from '../../../src/server/cards/sillyfication/NecroticBloom';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Ants} from '../../../src/server/cards/base/Ants';
import {AICentral} from '../../../src/server/cards/base/AICentral';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {runAllActions} from '../../TestingUtils';

describe('NecroticBloom', () => {
  let card: NecroticBloom;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new NecroticBloom();
    [game, player, player2] = testGame(2);
    player.playedCards.push(card);
  });

  it('gains a microbe when an opponent plays a plant or microbe tag', () => {
    player2.playCard(new Tardigrades());
    runAllActions(game);
    expect(card.resourceCount).to.eq(1);

    player2.playCard(new Ants());
    runAllActions(game);
    expect(card.resourceCount).to.eq(2);
  });

  it('ignores the owner and non plant/microbe tags', () => {
    player.playCard(new Tardigrades());
    runAllActions(game);
    expect(card.resourceCount).to.eq(0);

    player2.playCard(new AICentral());
    runAllActions(game);
    expect(card.resourceCount).to.eq(0);
  });

  it('action removes 3 microbes to raise plant production 1 step', () => {
    player.addResourceTo(card, 3);
    expect(card.canAct(player)).is.true;

    expect(card.action(player)).is.undefined;
    runAllActions(game);

    expect(card.resourceCount).to.eq(0);
    expect(player.production.plants).to.eq(1);
  });

  it('cannot act without 3 microbes', () => {
    player.addResourceTo(card, 2);
    expect(card.canAct(player)).is.false;
  });

  it('scores 1 VP per 3 microbes', () => {
    player.addResourceTo(card, 7);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });
});
