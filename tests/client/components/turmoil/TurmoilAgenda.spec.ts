import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import TurmoilAgenda from '@/client/components/turmoil/TurmoilAgenda.vue';
import {AGENDA_DESCRIPTIONS, MORE_PARTIES_AGENDA_DESCRIPTIONS} from '@/common/turmoil/AgendaDescriptions';
import {BonusId, PolicyId} from '@/common/turmoil/Types';

// Every id whose content differs under the More Parties expansion's "Political Agendas" rework
// -- kept in sync by hand with MORE_PARTIES_AGENDA_DESCRIPTIONS.
const REWORKED_IDS: ReadonlyArray<BonusId | PolicyId> = [
  'mb01', 'mp02', 'mp03', 'mp04',
  'sp01', 'sp03', 'sp04',
  'ub02', 'up02', 'up03', 'up04',
  'kb02', 'kp01', 'kp02', 'kp03',
  'rb02', 'rp02', 'rp03', 'rp04',
  'gp03', 'gp04',
];

describe('TurmoilAgenda', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'mp01',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('mounts without errors with a party badge', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'mp01',
        showPartyBadge: true,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows the vanilla hover description by default', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'rp02',
      },
    });
    expect(wrapper.attributes('data-tooltip')).to.eq(AGENDA_DESCRIPTIONS.rp02);
  });

  it('shows the More Parties hover description when the expansion is active', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'rp02',
        morePartiesExpansion: true,
      },
    });
    expect(wrapper.attributes('data-tooltip')).to.eq(MORE_PARTIES_AGENDA_DESCRIPTIONS.rp02);
    expect(wrapper.attributes('data-tooltip')).to.not.eq(AGENDA_DESCRIPTIONS.rp02);
  });

  it('falls back to the vanilla description under More Parties for ids whose content is unchanged', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'gb01',
        morePartiesExpansion: true,
      },
    });
    expect(wrapper.attributes('data-tooltip')).to.eq(AGENDA_DESCRIPTIONS.gb01);
  });

  for (const id of REWORKED_IDS) {
    it(`mounts ${id} without errors, vanilla and More Parties, with different markup`, () => {
      const vanilla = shallowMount(TurmoilAgenda, {...globalConfig, props: {id}});
      const reworked = shallowMount(TurmoilAgenda, {...globalConfig, props: {id, morePartiesExpansion: true}});
      expect(vanilla.exists()).to.be.true;
      expect(reworked.exists()).to.be.true;
      expect(vanilla.html()).to.not.eq(reworked.html());
      expect(reworked.attributes('data-tooltip')).to.eq(MORE_PARTIES_AGENDA_DESCRIPTIONS[id]);
    });
  }
});
