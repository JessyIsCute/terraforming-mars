import {expect} from 'chai';
import {testGame} from '../TestGame';
import {ConglomeratesExpansion} from '../../src/server/conglomerates/ConglomeratesExpansion';
import {CardName} from '../../src/common/cards/CardName';

describe('ConglomeratesExpansion', () => {
  describe('the 3 Team Action standard projects', () => {
    const TEAM_ACTION_NAMES = [CardName.GIVE_PATENT, CardName.FACILITY_SHARING, CardName.TEAM_DONATION];

    it('are not offered as standard projects when Conglomerates is off', () => {
      const [game] = testGame(4);
      const names = game.getStandardProjects().map((card) => card.name);
      for (const name of TEAM_ACTION_NAMES) {
        expect(names).to.not.include(name);
      }
    });

    it('are offered as standard projects when Conglomerates is on', () => {
      const [game] = testGame(4, {conglomeratesExpansion: true});
      const names = game.getStandardProjects().map((card) => card.name);
      for (const name of TEAM_ACTION_NAMES) {
        expect(names).to.include(name);
      }
    });

    it('are not offered in a player\'s action list when Conglomerates is off', () => {
      const [, player1] = testGame(4);
      const options = player1.getStandardProjectOption().cards.map((card) => card.name);
      for (const name of TEAM_ACTION_NAMES) {
        expect(options).to.not.include(name);
      }
    });
  });

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

  it('resets an escalated team action cost back to base at the start of the next generation', () => {
    const [, player1, , player3] = testGame(4, {conglomeratesExpansion: true});
    ConglomeratesExpansion.increaseTeamActionCost(player1, 'givePatent');
    expect(ConglomeratesExpansion.getTeamActionCost(player1, 'givePatent')).to.eq(3);
    player1.runProductionPhase();
    expect(ConglomeratesExpansion.getTeamActionCost(player1, 'givePatent')).to.eq(2);
    expect(ConglomeratesExpansion.getTeamActionCost(player3, 'givePatent')).to.eq(2);
  });
});
