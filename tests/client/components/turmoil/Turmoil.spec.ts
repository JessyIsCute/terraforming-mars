import {shallowMount} from '@vue/test-utils';
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

  it('shows the reference in Chairman and More Parties games', async () => {
    const wrapper = shallowMount(Turmoil, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
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
    await wrapper.setProps({agendaStyle: 'Random'});
    expect(wrapper.findComponent(TurmoilAgendaReference).exists()).is.false;
    await wrapper.setProps({agendaStyle: 'Chairman'});
    expect(wrapper.findComponent(TurmoilAgendaReference).props('parties')).to.deep.eq([
      {name: PartyName.SCIENTISTS, agenda: {bonusId: 'sb01', policyId: 'sp01'}},
    ]);
    await wrapper.setProps({agendaStyle: 'PartyLeaders', morePartiesExpansion: true});
    expect(wrapper.findComponent(TurmoilAgendaReference).props('morePartiesExpansion')).is.true;
  });
});
