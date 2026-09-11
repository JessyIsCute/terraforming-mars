import {expect} from 'chai';
import {HeavyMetalHustle} from '@/server/cards/blackmarket/HeavyMetalHustle';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('HeavyMetalHustle', () => {
  let card: HeavyMetalHustle;
  let player: TestPlayer;

  beforeEach(() => {
    card = new HeavyMetalHustle();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.tags).deep.eq([Tag.BUILDING, Tag.SPACE]);
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).deep.include({titanium: 3});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 3 titanium and gains 5 steel', () => {
    player.titanium = 3;
    expect(player.steel).to.eq(0);

    card.play(player);

    expect(player.titanium).to.eq(0);
    expect(player.steel).to.eq(5);
  });
});
