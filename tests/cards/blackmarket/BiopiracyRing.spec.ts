import {expect} from 'chai';
import {BiopiracyRing} from '@/server/cards/blackmarket/BiopiracyRing';
import {Tag} from '@/common/cards/Tag';
import {CardType} from '@/common/cards/CardType';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BiopiracyRing', () => {
  let card: BiopiracyRing;
  let player: TestPlayer;

  beforeEach(() => {
    card = new BiopiracyRing();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).deep.eq([Tag.MICROBE]);
    expect(card.cost).to.eq(5);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('can act only when affordable', () => {
    player.plants = 0;
    expect(card.canAct(player)).is.false;

    player.plants = 1;
    expect(card.canAct(player)).is.true;
  });

  it('action spends 1 plant and gains 5 M€', () => {
    player.plants = 1;
    const before = player.megaCredits;

    card.action(player);

    expect(player.plants).to.eq(0);
    expect(player.megaCredits).to.eq(before + 5);
  });
});
