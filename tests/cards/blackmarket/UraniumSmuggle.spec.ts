import {expect} from 'chai';
import {UraniumSmuggle, UraniumSmuggleII} from '@/server/cards/blackmarket/UraniumSmuggle';
import {CardName} from '@/common/cards/CardName';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UraniumSmuggle', () => {
  let card: UraniumSmuggle;
  let player: TestPlayer;

  beforeEach(() => {
    card = new UraniumSmuggle();
    [, player] = testGame(2);
  });

  it('has no printed price -- the market owns it', () => {
    expect(card.cost).to.eq(0);
    expect(card.reserveUnits).to.deep.eq({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: 0, heat: 0});
  });

  it('has the printed tag and VP', () => {
    expect(card.tags).deep.eq([Tag.POWER]);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises energy production and gains 1 titanium', () => {
    expect(player.production.energy).to.eq(0);
    expect(player.titanium).to.eq(0);

    card.play(player);

    expect(player.production.energy).to.eq(1);
    expect(player.titanium).to.eq(1);
  });

  it('the II printing is a distinct CardName sharing the same behavior', () => {
    const printing = new UraniumSmuggleII();
    expect(printing.name).to.not.eq(CardName.URANIUM_SMUGGLE);
    expect(printing.cost).to.eq(0);
    expect(printing.tags).deep.eq([Tag.POWER]);
  });
});
