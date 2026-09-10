import {expect} from 'chai';
import {PoachedSpecimens} from '@/server/cards/blackmarket/PoachedSpecimens';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('PoachedSpecimens', () => {
  let card: PoachedSpecimens;
  let player: TestPlayer;

  beforeEach(() => {
    card = new PoachedSpecimens();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.ANIMAL]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({plants: 1, energy: 2});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 1 plant and 2 energy and gains 6 M€', () => {
    player.plants = 1;
    player.energy = 2;
    const before = player.megaCredits;

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.energy).to.eq(0);
    expect(player.megaCredits).to.eq(before + 6);
  });
});
