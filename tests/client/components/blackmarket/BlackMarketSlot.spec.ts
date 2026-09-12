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

  it('regression: does not crash when the slot is null (JSON turns an empty array slot into null, not undefined)', () => {
    const wrapper = shallowMount(BlackMarketSlot, {
      ...globalConfig,
      props: {card: null},
    });
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.false;
  });

  it('renders the card when a slot is present', () => {
    const wrapper = shallowMount(BlackMarketSlot, {
      ...globalConfig,
      props: {card: {name: CardName.SMUGGLED_REACTOR_CORE}},
    });
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.true;
  });

  it('plays and then clears the entrance animation when the card is replaced', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = shallowMount(BlackMarketSlot, {
        ...globalConfig,
        props: {card: {name: CardName.SMUGGLED_REACTOR_CORE}},
      });
      expect(wrapper.classes()).to.not.include('black-market-slot--entering-right');

      await wrapper.setProps({card: {name: CardName.STOLEN_BLUEPRINTS}});
      expect(wrapper.classes()).to.include('black-market-slot--entering-right');

      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).to.not.include('black-market-slot--entering-right');
    } finally {
      vi.useRealTimers();
    }
  });
});
