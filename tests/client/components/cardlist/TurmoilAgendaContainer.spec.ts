import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import TurmoilAgendaContainer from '@/client/components/cardlist/TurmoilAgendaContainer.vue';
import {AGENDA_DESCRIPTIONS, MORE_PARTIES_AGENDA_DESCRIPTIONS} from '@/common/turmoil/AgendaDescriptions';

describe('TurmoilAgendaContainer', () => {
  it('mounts without errors', () => {
    const wrapper = mount(TurmoilAgendaContainer, {
      ...globalConfig,
      props: {
        agendaId: 'mp01',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('hides the description text until clicked, then shows it', async () => {
    const wrapper = mount(TurmoilAgendaContainer, {
      ...globalConfig,
      props: {
        agendaId: 'rp02',
      },
    });
    expect(wrapper.find('.description').exists()).to.be.false;

    await wrapper.find('.container').trigger('click');

    expect(wrapper.find('.description').exists()).to.be.true;
    expect(wrapper.find('.description').text()).to.eq(AGENDA_DESCRIPTIONS.rp02);
  });

  it('shows the More Parties description text when that expansion is active', async () => {
    const wrapper = mount(TurmoilAgendaContainer, {
      ...globalConfig,
      props: {
        agendaId: 'rp02',
        morePartiesExpansion: true,
      },
    });

    await wrapper.find('.container').trigger('click');

    expect(wrapper.find('.description').text()).to.eq(MORE_PARTIES_AGENDA_DESCRIPTIONS.rp02);
  });
});
