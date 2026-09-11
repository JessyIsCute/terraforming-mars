import {expect} from 'chai';
import {UraniumSmuggle, UraniumSmuggleII, UraniumSmuggleIII} from '@/server/cards/blackmarket/UraniumSmuggle';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UraniumSmuggle', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    const card = new UraniumSmuggle();
    expect(card.cost).to.eq(8);
    expect(card.tags).deep.eq([Tag.POWER]);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises energy production and gains 1 titanium', () => {
    const card = new UraniumSmuggle();
    expect(player.production.energy).to.eq(0);
    expect(player.titanium).to.eq(0);

    card.play(player);

    expect(player.production.energy).to.eq(1);
    expect(player.titanium).to.eq(1);
  });

  it('printings II and III are distinct CardNames with an escalating price', () => {
    const printings = [new UraniumSmuggle(), new UraniumSmuggleII(), new UraniumSmuggleIII()];
    expect(new Set(printings.map((c) => c.name)).size).to.eq(3);
    expect(printings.map((c) => c.cost)).deep.eq([8, 9, 10]);
  });
});
