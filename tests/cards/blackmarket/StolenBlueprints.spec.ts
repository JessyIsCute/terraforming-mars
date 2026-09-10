import {expect} from 'chai';
import {StolenBlueprints} from '@/server/cards/blackmarket/StolenBlueprints';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('StolenBlueprints', () => {
  let card: StolenBlueprints;
  let player: TestPlayer;

  beforeEach(() => {
    card = new StolenBlueprints();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING, Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({steel: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 2 steel and draws a card', () => {
    player.steel = 2;
    expect(player.cardsInHand).has.lengthOf(0);

    card.play(player);

    expect(player.steel).to.eq(0);
    expect(player.cardsInHand).has.lengthOf(1);
  });
});
