import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {vi} from 'vitest';
import {globalConfig} from '../getLocalVue';
import BlackMarketSlot from '@/client/components/blackmarket/BlackMarketSlot.vue';
import {CardName} from '@/common/cards/CardName';

describe('BlackMarketSlot', () => {
  it('mounts without errors when empty', () => {
    const wrapper = shallowMount(BlackMarketSlot, {...globalConfig});
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.false;
  });

  it('renders the card and its market-owned price when a slot is present', () => {
    const wrapper = shallowMount(BlackMarketSlot, {
      ...globalConfig,
      props: {marketSlot: {card: {name: CardName.SMUGGLED_REACTOR_CORE}, price: {titanium: 2}}},
    });
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.true;
    expect(wrapper.find('.black-market-price-badge').text()).to.eq('2 titanium');
  });

  it('formats a mixed M€ + non-M€ price', () => {
    const wrapper = shallowMount(BlackMarketSlot, {
      ...globalConfig,
      props: {marketSlot: {card: {name: CardName.COUNTERFEIT_CERTIFICATES}, price: {megacredits: 2, heat: 1}}},
    });
    expect(wrapper.find('.black-market-price-badge').text()).to.eq('2 M€, 1 heat');
  });

  it('plays and then clears the entrance animation when the card is replaced', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = shallowMount(BlackMarketSlot, {
        ...globalConfig,
        props: {marketSlot: {card: {name: CardName.SMUGGLED_REACTOR_CORE}, price: {titanium: 2}}},
      });
      expect(wrapper.classes()).to.not.include('black-market-slot--entering-right');

      await wrapper.setProps({marketSlot: {card: {name: CardName.STOLEN_BLUEPRINTS}, price: {steel: 2}}});
      expect(wrapper.classes()).to.include('black-market-slot--entering-right');

      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).to.not.include('black-market-slot--entering-right');
    } finally {
      vi.useRealTimers();
    }
  });
});
