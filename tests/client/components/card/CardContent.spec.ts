import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardContent from '@/client/components/card/CardContent.vue';

describe('CardContent', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardContent, {
      ...globalConfig,
      props: {
        metadata: {
          cardNumber: '001',
          renderData: undefined,
          description: undefined,
        },
        requirements: [],
        isCorporation: false,
        bottomPadding: '',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the mutation effect text with the glow class when set', () => {
    const wrapper = shallowMount(CardContent, {
      ...globalConfig,
      props: {
        metadata: {
          cardNumber: '001',
          renderData: undefined,
          description: undefined,
        },
        requirements: [],
        isCorporation: false,
        bottomPadding: '',
        mutationText: 'Gain 2 Plants on play',
      },
    });
    const el = wrapper.find('.mutation-glow');
    expect(el.exists()).to.be.true;
    expect(el.classes()).to.include('card-description');
    expect(el.text()).to.eq('Gain 2 Plants on play');
  });

  it('renders no mutation description with no mutationText', () => {
    const wrapper = shallowMount(CardContent, {
      ...globalConfig,
      props: {
        metadata: {
          cardNumber: '001',
          renderData: undefined,
          description: undefined,
        },
        requirements: [],
        isCorporation: false,
        bottomPadding: '',
      },
    });
    expect(wrapper.find('.mutation-glow').exists()).to.be.false;
  });
});
