import {expect} from 'chai';
import {testGame} from '../TestGame';
import {ConglomeratesExpansion} from '../../src/server/conglomerates/ConglomeratesExpansion';

describe('ConglomeratesExpansion', () => {
  it('pairs a 4-player game into two teams by table order', () => {
    const [, player1, player2, player3, player4] = testGame(4, {conglomeratesExpansion: true});

    expect(player1.teammates().map((p) => p.id)).to.deep.eq([player3.id]);
    expect(player3.teammates().map((p) => p.id)).to.deep.eq([player1.id]);
    expect(player2.teammates().map((p) => p.id)).to.deep.eq([player4.id]);
    expect(player4.teammates().map((p) => p.id)).to.deep.eq([player2.id]);
  });

  it('has no teammates when Conglomerates is off', () => {
    const [, player1] = testGame(4);
    expect(player1.teammates()).to.be.empty;
  });

  it('grants 1 coordination at game start', () => {
    const [, player1] = testGame(4, {conglomeratesExpansion: true});
    expect(player1.conglomeratesData.coordination).to.eq(1);
  });

  it('grants 2 coordination per player at the start of each generation', () => {
    const [, player1] = testGame(4, {conglomeratesExpansion: true});
    player1.runProductionPhase();
    expect(player1.conglomeratesData.coordination).to.eq(3);
    player1.runProductionPhase();
    expect(player1.conglomeratesData.coordination).to.eq(5);
  });

  it('does not grant coordination when Conglomerates is off', () => {
    const [, player1] = testGame(4);
    player1.runProductionPhase();
    expect(player1.conglomeratesData.coordination).to.eq(1);
  });

  it('escalates a team action cost for both teammates after use', () => {
    const [, player1, , player3] = testGame(4, {conglomeratesExpansion: true});
    expect(ConglomeratesExpansion.getTeamActionCost(player1, 'givePatent')).to.eq(2);
    ConglomeratesExpansion.increaseTeamActionCost(player1, 'givePatent');
    expect(ConglomeratesExpansion.getTeamActionCost(player1, 'givePatent')).to.eq(3);
    expect(ConglomeratesExpansion.getTeamActionCost(player3, 'givePatent')).to.eq(3);
  });
});
