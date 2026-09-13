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
});
