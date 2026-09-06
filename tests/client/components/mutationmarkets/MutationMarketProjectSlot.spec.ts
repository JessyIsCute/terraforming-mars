import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {vi} from 'vitest';
import {globalConfig} from '../getLocalVue';
import MutationMarketProjectSlot from '@/client/components/mutationmarkets/MutationMarketProjectSlot.vue';
import {MutationMarketProjectSlotModel} from '@/common/models/MutationMarketModel';
import {CardName} from '@/common/cards/CardName';
import {MutationName} from '@/common/mutationmarkets/MutationName';

function slotFor(name: CardName, overrides: Partial<MutationMarketProjectSlotModel & object> = {}): MutationMarketProjectSlotModel {
  return {
    card: {name},
    active: true,
    coveringMutations: [],
    ...overrides,
  };
}

describe('MutationMarketProjectSlot', () => {
  it('mounts without errors when empty', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {...globalConfig});
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.false;
  });

  it('renders the card when a slot is present', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER)},
    });
    expect(wrapper.findComponent({name: 'Card'}).exists()).to.be.true;
    expect(wrapper.find('.mutation-market-inactive-overlay').exists()).to.be.false;
  });

  it('shows the inactive overlay for a preview slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {active: false})},
    });
    expect(wrapper.find('.mutation-market-inactive-overlay').exists()).to.be.true;
  });

  it('previews one covering mutation for a singly-covered slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {coveringMutations: [MutationName.MINI_MUTATION]})},
    });
    const badges = wrapper.findAll('.mutation-market-preview-badge');
    expect(badges).to.have.lengthOf(1);
    expect(badges[0].text()).to.eq(MutationName.MINI_MUTATION);
  });

  it('previews both covering mutations for a doubly-covered slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {coveringMutations: [MutationName.TAG_DIVERSIFIER, MutationName.MINI_MUTATION]})},
    });
    expect(wrapper.findAll('.mutation-market-preview-badge')).to.have.lengthOf(2);
  });

  it('shows no preview badges when nothing covers the slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER)},
    });
    expect(wrapper.find('.mutation-market-preview-badges').exists()).to.be.false;
  });

  it('shows the current high bid when an auction is open', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {auction: {highBid: 5, highBidderColor: 'red'}})},
    });
    const badge = wrapper.find('.mutation-market-auction-badge');
    expect(badge.exists()).to.be.true;
    expect(badge.text()).to.contain('5');
    expect(badge.classes()).to.include('board-cube--red');
  });

  it('plays and then clears the entrance animation when the card is replaced', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = shallowMount(MutationMarketProjectSlot, {
        ...globalConfig,
        props: {marketSlot: slotFor(CardName.PLANT_EATER)},
      });
      expect(wrapper.classes()).to.not.include('mutation-market-slot--entering-right');

      await wrapper.setProps({marketSlot: slotFor(CardName.ASTEROID)});
      expect(wrapper.classes()).to.include('mutation-market-slot--entering-right');

      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).to.not.include('mutation-market-slot--entering-right');
    } finally {
      vi.useRealTimers();
    }
  });
});
