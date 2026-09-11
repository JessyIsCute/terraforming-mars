import {expect} from 'chai';
import {ThermalSkimOperation} from '@/server/cards/blackmarket/ThermalSkimOperation';
import {IGame} from '@/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {setTemperature} from '../../TestingUtils';

describe('ThermalSkimOperation', () => {
  let card: ThermalSkimOperation;
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new ThermalSkimOperation();
    [game, player, player2] = testGame(2);
    setTemperature(game, 4);
  });

  it('play gains 2 heat', () => {
    card.play(player);
    expect(player.heat).to.eq(2);
  });

  it('gains 1 heat when the temperature is raised by 1 step', () => {
    player.playedCards.push(card);
    game.increaseTemperature(player, 1);
    expect(player.heat).to.eq(1);
  });

  it('gains 1 heat per step when the temperature is raised multiple steps at once', () => {
    player.playedCards.push(card);
    game.increaseTemperature(player, 2);
    expect(player.heat).to.eq(2);
  });

  it('does not gain heat when oxygen is raised', () => {
    player.playedCards.push(card);
    game.increaseOxygenLevel(player, 1);
    expect(player.heat).to.eq(0);
  });

  it('only gains heat when the card owner is credited with raising the temperature', () => {
    player.playedCards.push(card);
    game.increaseTemperature(player2, 1);
    expect(player.heat).to.eq(0);
  });
});
