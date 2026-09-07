import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardTitle from '@/client/components/card/CardTitle.vue';
import {CardType} from '@/common/cards/CardType';
import {CardName} from '@/common/cards/CardName';

describe('CardTitle', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardTitle, {
      ...globalConfig,
      props: {
        title: 'Test Card' as CardName,
        type: CardType.AUTOMATED,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the real title with no displayTitle/mutated props', () => {
    const wrapper = shallowMount(CardTitle, {
      ...globalConfig,
      props: {
        title: 'Gigantic Asteroid' as CardName,
        type: CardType.AUTOMATED,
      },
    });
    expect(wrapper.text()).to.contain('Gigantic Asteroid');
    expect(wrapper.find('.mutated-label').exists()).to.be.false;
  });

  it('renders displayTitle in place of title, and the Mutated ribbon, when mutated', () => {
    const wrapper = shallowMount(CardTitle, {
      ...globalConfig,
      props: {
        title: 'Gigantic Asteroid' as CardName,
        type: CardType.AUTOMATED,
        displayTitle: 'Diverse Gigantic Asteroid',
        mutated: true,
      },
    });
    expect(wrapper.text()).to.contain('Diverse Gigantic Asteroid');
    expect(wrapper.find('.mutated-label').exists()).to.be.true;
    expect(wrapper.find('.mutated-label').text()).to.eq('Mutated');
  });
});
