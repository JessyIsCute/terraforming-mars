import {expect} from 'chai';
import {OrbitalSmugglingRing} from '@/server/cards/blackmarket/OrbitalSmugglingRing';
import {Tag} from '@/common/cards/Tag';
import {CardType} from '@/common/cards/CardType';
import {IGame} from '@/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('OrbitalSmugglingRing', () => {
  let card: OrbitalSmugglingRing;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new OrbitalSmugglingRing();
    [game, player] = testGame(2, {venusNextExtension: true});
  });

  it('has the printed stats', () => {
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).deep.eq([Tag.VENUS]);
    expect(card.cost).to.eq(9);
    expect(card.victoryPoints).to.eq(-2);
  });

  it('can act only when affordable', () => {
    player.titanium = 0;
    expect(card.canAct(player)).is.false;

    player.titanium = 1;
    expect(card.canAct(player)).is.true;
  });

  it('action spends 1 titanium and raises Venus 1 step', () => {
    player.titanium = 1;
    const beforeVenus = game.getVenusScaleLevel();

    card.action(player);

    expect(player.titanium).to.eq(0);
    expect(game.getVenusScaleLevel()).to.eq(beforeVenus + 2);
  });
});
