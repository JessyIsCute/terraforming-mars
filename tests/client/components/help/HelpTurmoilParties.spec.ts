import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import HelpTurmoilParties from '@/client/components/help/HelpTurmoilParties.vue';

describe('HelpTurmoilParties', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(HelpTurmoilParties, {
      ...globalConfig,
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('lists all 12 parties, including the 6 placeholder ones', () => {
    const wrapper = shallowMount(HelpTurmoilParties, {
      ...globalConfig,
    });
    const text = wrapper.text();
    for (const name of ['Mars First', 'Scientists', 'Unity', 'Kelvinists', 'Reds', 'Greens',
      'Populists', 'Spome', 'Empower', 'Bureaucrats', 'Centrists', 'Transhumanists']) {
      expect(text).to.contain(name);
    }
  });

  it('shows a party badge icon (not just the name) for every party', () => {
    const wrapper = shallowMount(HelpTurmoilParties, {
      ...globalConfig,
    });
    expect(wrapper.findAll('.party-badge')).to.have.lengthOf(12);
  });

  it('lays the parties out in a grid, not one long vertical list', () => {
    const wrapper = shallowMount(HelpTurmoilParties, {
      ...globalConfig,
    });
    expect(wrapper.find('.help-parties-grid').exists()).is.true;
    expect(wrapper.findAll('.help-party-card')).to.have.lengthOf(12);
  });
});
