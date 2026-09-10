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

  it('has the printed stats and no printed price -- the market owns it', () => {
    expect(card.tags).deep.eq([Tag.ANIMAL]);
    expect(card.cost).to.eq(0);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play gains 6 M€', () => {
    const before = player.megaCredits;
    card.play(player);
    expect(player.megaCredits).to.eq(before + 6);
  });
});
