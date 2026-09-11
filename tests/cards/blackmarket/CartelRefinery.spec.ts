import {expect} from 'chai';
import {CartelRefinery} from '@/server/cards/blackmarket/CartelRefinery';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('CartelRefinery', () => {
  let card: CartelRefinery;
  let player: TestPlayer;

  beforeEach(() => {
    card = new CartelRefinery();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.POWER, Tag.PLANT]);
    expect(card.cost).to.eq(1);
    expect(card.reserveUnits).deep.include({steel: 3});
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play spends 3 steel, raises heat production 3 steps, and gains 3 plants', () => {
    player.steel = 3;
    expect(player.production.heat).to.eq(0);
    expect(player.plants).to.eq(0);

    card.play(player);

    expect(player.steel).to.eq(0);
    expect(player.production.heat).to.eq(3);
    expect(player.plants).to.eq(3);
  });
});
