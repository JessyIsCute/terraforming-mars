import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MutationCard from '@/client/components/mutationmarkets/MutationCard.vue';
import {MutationName} from '@/common/mutationmarkets/MutationName';

describe('MutationCard', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(MutationCard, {
      ...globalConfig,
      props: {mutation: MutationName.TAG_DIVERSIFIER},
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the mutation name, prefix, requirement, reward, and effect', () => {
    const wrapper = shallowMount(MutationCard, {
      ...globalConfig,
      props: {mutation: MutationName.TAG_DIVERSIFIER},
    });
    expect(wrapper.text()).to.contain('Tag Diversifier');
    expect(wrapper.text()).to.contain('Diverse');
    expect(wrapper.text()).to.contain('Needs: 5 unique tags');
    expect(wrapper.text()).to.contain('Reward: +1 TR');
    expect(wrapper.text()).to.contain('Gains a random new tag');
  });

  it('renders a different mutation correctly', () => {
    const wrapper = shallowMount(MutationCard, {
      ...globalConfig,
      props: {mutation: MutationName.NESTED_MUTATION},
    });
    expect(wrapper.text()).to.contain('Nested Mutation');
    expect(wrapper.text()).to.contain('Playing it grants a 40% cheaper copy');
  });
});
