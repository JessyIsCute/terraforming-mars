import {mount, shallowMount} from '@vue/test-utils';
import {nextTick} from 'vue';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import Turmoil from '@/client/components/turmoil/Turmoil.vue';
import {PartyName} from '@/common/turmoil/PartyName';
import {fakePoliticalAgendasModel} from '../testHelpers';
import TurmoilAgendaReference from '@/client/components/turmoil/TurmoilAgendaReference.vue';

describe('Turmoil', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(Turmoil, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        mixins: [{
          methods: {
            getVisibilityState: () => true,
            setVisibilityState: () => {},
          },
        }],
      },
      props: {
        turmoil: {
          dominant: PartyName.REDS,
          ruling: PartyName.REDS,
          chairman: undefined,
          parties: [],
          lobby: [],
          reserve: [],
          distant: undefined,
          coming: undefined,
          current: undefined,
          politicalAgendas: fakePoliticalAgendasModel(),
          policyActionUsers: [],
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('opens the agenda reference through Policies and closes it with Escape or Close', async () => {
    const wrapper = mount(Turmoil, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {teleport: true},
        mixins: [{methods: {getVisibilityState: () => false, setVisibilityState: () => {}}}],
      },
      props: {
        turmoil: {
          dominant: PartyName.SCIENTISTS, ruling: PartyName.SCIENTISTS, chairman: undefined,
          parties: [{name: PartyName.SCIENTISTS, partyLeader: undefined, delegates: []}],
          lobby: [], reserve: [], distant: undefined, coming: undefined, current: undefined,
          politicalAgendas: fakePoliticalAgendasModel(), policyActionUsers: [],
        },
      },
    });
    expect(wrapper.findComponent(TurmoilAgendaReference).exists()).is.false;
    expect(wrapper.find('.policies-global').exists()).is.true;
    await wrapper.setProps({agendaStyle: 'Chairman'});
    expect(wrapper.findComponent(TurmoilAgendaReference).exists()).is.false;
    expect(wrapper.find('.policies-global').exists()).is.false;
    await wrapper.find('.policies-clickable').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).is.true;
    expect(wrapper.findComponent(TurmoilAgendaReference).props('parties')).to.deep.eq([
      {name: PartyName.SCIENTISTS, agenda: {bonusId: 'sb01', policyId: 'sp01'}},
    ]);
    expect(wrapper.findComponent(TurmoilAgendaReference).findAll('[data-agenda-id]')).to.have.length(6);
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    await nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).is.false;

    await wrapper.setProps({agendaStyle: 'Random'});
    await wrapper.find('.policies-clickable').trigger('click');
    expect(wrapper.find('.policies-global').exists()).is.false;
    expect(wrapper.findComponent(TurmoilAgendaReference).findAll('[data-agenda-id]').map((option) => option.attributes('data-agenda-id')))
      .to.deep.eq(['sp01']);
    await wrapper.find('.close-button').trigger('click');
    expect(wrapper.findComponent(TurmoilAgendaReference).exists()).is.false;

    await wrapper.setProps({agendaStyle: 'PartyLeaders', morePartiesExpansion: true});
    await wrapper.find('.policies-clickable').trigger('click');
    expect(wrapper.findComponent(TurmoilAgendaReference).props('morePartiesExpansion')).is.true;
    expect(wrapper.findComponent(TurmoilAgendaReference).findAll('[data-agenda-id]')).to.have.length(1);
  });
});
