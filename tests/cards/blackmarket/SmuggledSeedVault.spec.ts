import {expect} from 'chai';
import {SmuggledSeedVault} from '@/server/cards/blackmarket/SmuggledSeedVault';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('SmuggledSeedVault', () => {
  let card: SmuggledSeedVault;
  let player: TestPlayer;

  beforeEach(() => {
    card = new SmuggledSeedVault();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.PLANT]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({plants: 4});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 4 plants and raises titanium production 2 steps', () => {
    player.plants = 4;
    expect(player.production.titanium).to.eq(0);

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.production.titanium).to.eq(2);
  });
});
