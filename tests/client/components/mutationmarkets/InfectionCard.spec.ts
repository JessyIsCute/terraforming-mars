import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import InfectionCard from '@/client/components/mutationmarkets/InfectionCard.vue';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';

describe('InfectionCard', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(InfectionCard, {
      ...globalConfig,
      props: {infection: InfectionName.COST_INFLATION},
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the infection name, prefix, and effect (no requirement line, unlike mutations)', () => {
    const wrapper = shallowMount(InfectionCard, {
      ...globalConfig,
      props: {infection: InfectionName.COST_INFLATION},
    });
    expect(wrapper.text()).to.contain('Cost Inflation');
    expect(wrapper.text()).to.contain('Overpriced');
    expect(wrapper.text()).to.contain('Cost +4 M€');
    expect(wrapper.text()).to.not.contain('Needs:');
  });

  it('renders a different infection correctly', () => {
    const wrapper = shallowMount(InfectionCard, {
      ...globalConfig,
      props: {infection: InfectionName.POWER_DRAIN},
    });
    expect(wrapper.text()).to.contain('Power Drain');
    expect(wrapper.text()).to.contain('Costs 2 Energy to play');
  });

  it('renders one of the newer resource-cost infections correctly', () => {
    const wrapper = shallowMount(InfectionCard, {
      ...globalConfig,
      props: {infection: InfectionName.TITANIUM_CORROSION},
    });
    expect(wrapper.text()).to.contain('Titanium Corrosion');
    expect(wrapper.text()).to.contain('Corroded');
    expect(wrapper.text()).to.contain('Costs 1 Titanium to play');
  });
});
