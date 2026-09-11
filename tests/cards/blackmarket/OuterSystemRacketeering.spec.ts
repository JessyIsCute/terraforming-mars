import {expect} from 'chai';
import {OuterSystemRacketeering} from '@/server/cards/blackmarket/OuterSystemRacketeering';
import {Tag} from '@/common/cards/Tag';
import {CardType} from '@/common/cards/CardType';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('OuterSystemRacketeering', () => {
  let card: OuterSystemRacketeering;
  let player: TestPlayer;

  beforeEach(() => {
    card = new OuterSystemRacketeering();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).deep.eq([Tag.JOVIAN]);
    expect(card.cost).to.eq(7);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('can act only when affordable', () => {
    player.energy = 1;
    expect(card.canAct(player)).is.false;

    player.energy = 2;
    expect(card.canAct(player)).is.true;
  });

  it('action spends 2 energy and gains 5 M€', () => {
    player.energy = 2;
    const before = player.megaCredits;

    card.action(player);

    expect(player.energy).to.eq(0);
    expect(player.megaCredits).to.eq(before + 5);
  });
});
