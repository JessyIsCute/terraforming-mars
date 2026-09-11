import {expect} from 'chai';
import {RogueTerraformingCartel} from '@/server/cards/blackmarket/RogueTerraformingCartel';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('RogueTerraformingCartel', () => {
  let card: RogueTerraformingCartel;
  let player: TestPlayer;

  beforeEach(() => {
    card = new RogueTerraformingCartel();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.EARTH]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({titanium: 4, steel: 4});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 4 titanium and 4 steel and gains 6 TR', () => {
    player.titanium = 4;
    player.steel = 4;
    const before = player.terraformRating;

    card.play(player);

    expect(player.titanium).to.eq(0);
    expect(player.steel).to.eq(0);
    expect(player.terraformRating).to.eq(before + 6);
  });
});
