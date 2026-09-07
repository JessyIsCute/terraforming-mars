import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import ConglomeratesTeams from '@/client/components/conglomerates/ConglomeratesTeams.vue';
import {ConglomeratesModel} from '@/common/models/ConglomeratesModel';

function fakeModel(): ConglomeratesModel {
  return {
    teams: [
      {
        id: 'team-1',
        playerIds: ['p-blue-id', 'p-yellow-id'] as any,
        playerColors: ['blue', 'yellow'],
        name: 'Blue & Yellow',
        victoryPoints: {players: 30, milestones: 8, awards: 0, bonuses: 0, total: 38},
      },
      {
        id: 'team-2',
        playerIds: ['p-red-id', 'p-green-id'] as any,
        playerColors: ['red', 'green'],
        name: 'Red & Green',
        victoryPoints: {players: 20, milestones: 0, awards: 8, bonuses: 0, total: 28},
      },
    ],
  };
}

describe('ConglomeratesTeams', () => {
  it('renders nothing when there are no teams', () => {
    const wrapper = shallowMount(ConglomeratesTeams, {
      ...globalConfig,
      props: {model: {teams: []}},
    });
    expect(wrapper.find('.conglomerates-teams').exists()).to.be.false;
  });

  it('renders one card per team with its live VP breakdown', () => {
    const wrapper = shallowMount(ConglomeratesTeams, {
      ...globalConfig,
      props: {model: fakeModel()},
    });
    const teamCards = wrapper.findAll('.conglomerates-team');
    expect(teamCards).to.have.lengthOf(2);
    expect(teamCards[0].find('.conglomerates-team-name').text()).to.eq('Blue & Yellow');
    expect(teamCards[0].find('.conglomerates-team-total').text()).to.eq('38');
    expect(teamCards[0].findAll('.conglomerates-team-swatch')).to.have.lengthOf(2);
  });

  it('toggles the breakdown visibility when the title is clicked', async () => {
    const wrapper = shallowMount(ConglomeratesTeams, {
      ...globalConfig,
      props: {model: fakeModel()},
    });
    expect(wrapper.vm.expanded).to.be.true;
    await wrapper.find('.ma-clickable').trigger('click');
    expect(wrapper.vm.expanded).to.be.false;
  });
});
