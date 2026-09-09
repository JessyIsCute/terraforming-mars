import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import GameEnd from '@/client/components/GameEnd.vue';
import {fakePlayerViewModel, fakeSpectatorModel, fakePublicPlayerModel, fakeGameModel} from './testHelpers';
import {ConglomeratesTeamModel} from '@/common/models/ConglomeratesModel';

describe('GameEnd', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(GameEnd, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        spectator: fakeSpectatorModel(),
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('ranks players by their team\'s combined score in a Conglomerates game, not their own individual total', () => {
    // Red has the highest INDIVIDUAL total (10), but red+yellow's team total (13) is lower
    // than blue+green's (16) -- milestone/award VP is team-only, so ranking must go by team.
    const players = [
      fakePublicPlayerModel({color: 'red', victoryPointsBreakdown: {total: 10}, megacredits: 0}),
      fakePublicPlayerModel({color: 'blue', victoryPointsBreakdown: {total: 5}, megacredits: 0}),
      fakePublicPlayerModel({color: 'yellow', victoryPointsBreakdown: {total: 3}, megacredits: 0}),
      fakePublicPlayerModel({color: 'green', victoryPointsBreakdown: {total: 3}, megacredits: 0}),
    ];
    const teamA: ConglomeratesTeamModel = {
      id: 'team-1', playerIds: [], playerColors: ['red', 'yellow'], teamColor: 'orange',
      memberScores: [10, 3], name: 'Team A',
      victoryPoints: {players: 13, milestones: 0, awards: 0, bonuses: 0, total: 13},
    };
    const teamB: ConglomeratesTeamModel = {
      id: 'team-2', playerIds: [], playerColors: ['blue', 'green'], teamColor: 'purple',
      memberScores: [5, 3], name: 'Team B',
      victoryPoints: {players: 8, milestones: 8, awards: 0, bonuses: 0, total: 16},
    };
    const wrapper = shallowMount(GameEnd, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel({
          players,
          game: fakeGameModel({conglomerates: {teams: [teamA, teamB]}}),
        }),
        spectator: fakeSpectatorModel(),
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.winners.map((p: any) => p.color)).to.have.members(['blue', 'green']);
  });
});
