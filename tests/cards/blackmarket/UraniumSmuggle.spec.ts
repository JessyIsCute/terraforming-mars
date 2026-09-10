import {expect} from 'chai';
import {UraniumSmuggle, UraniumSmuggleII, URANIUM_SMUGGLE_MIN_COST, URANIUM_SMUGGLE_MAX_COST} from '@/server/cards/blackmarket/UraniumSmuggle';
import {CardName} from '@/common/cards/CardName';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UraniumSmuggle', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('defaults to the minimum listed price when constructed with no override', () => {
    const card = new UraniumSmuggle();
    expect(card.cost).to.eq(URANIUM_SMUGGLE_MIN_COST);
  });

  it('a rolled price is exposed via cost, bypassing the shared properties cache', () => {
    const cheap = new UraniumSmuggle(CardName.URANIUM_SMUGGLE, URANIUM_SMUGGLE_MIN_COST);
    const expensive = new UraniumSmuggle(CardName.URANIUM_SMUGGLE, URANIUM_SMUGGLE_MAX_COST);
    expect(cheap.cost).to.eq(URANIUM_SMUGGLE_MIN_COST);
    expect(expensive.cost).to.eq(URANIUM_SMUGGLE_MAX_COST);
  });

  it('has the printed tag and VP', () => {
    const card = new UraniumSmuggle();
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

  it('the II printing is a distinct CardName sharing the same behavior', () => {
    const printing = new UraniumSmuggleII();
    expect(printing.name).to.not.eq(CardName.URANIUM_SMUGGLE);
    expect(printing.cost).to.eq(URANIUM_SMUGGLE_MIN_COST);
    expect(printing.tags).deep.eq([Tag.POWER]);
  });
});
