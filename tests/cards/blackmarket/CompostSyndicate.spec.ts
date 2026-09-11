import {expect} from 'chai';
import {CompostSyndicate} from '@/server/cards/blackmarket/CompostSyndicate';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('CompostSyndicate', () => {
  let card: CompostSyndicate;
  let player: TestPlayer;

  beforeEach(() => {
    card = new CompostSyndicate();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({plants: 3});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 3 plants and gains 5 steel', () => {
    player.plants = 3;
    expect(player.steel).to.eq(0);

    card.play(player);

    expect(player.plants).to.eq(0);
    expect(player.steel).to.eq(5);
  });
});
