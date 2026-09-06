import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {vi} from 'vitest';
import {globalConfig} from '../getLocalVue';
import MutationMarketMutationSlot from '@/client/components/mutationmarkets/MutationMarketMutationSlot.vue';
import {MutationMarketMutationSlotModel} from '@/common/models/MutationMarketModel';
import {MutationName} from '@/common/mutationmarkets/MutationName';

function slotFor(mutation: MutationName, active = true): MutationMarketMutationSlotModel {
  return {mutation, active, minimumBid: 2};
}

describe('MutationMarketMutationSlot', () => {
  it('mounts without errors when empty', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {gridColumn: '1 / span 2'},
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the mutation name, minimum bid, and steps when present', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '1 / span 2'},
    });
    expect(wrapper.text()).to.contain('Tag Diversifier');
    expect(wrapper.text()).to.contain('2');
    expect(wrapper.find('.mutation-market-inactive-overlay').exists()).to.be.false;
  });

  it('applies the given grid-column style', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '4 / span 2'},
    });
    expect((wrapper.element as HTMLElement).style.gridColumn).to.eq('4 / span 2');
  });

  it('shows the inactive overlay for a preview mutation', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER, false), gridColumn: '1 / span 2'},
    });
    expect(wrapper.find('.mutation-market-inactive-overlay').exists()).to.be.true;
  });

  it('renders requirement, reward, and effect text', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '1 / span 2'},
    });
    expect(wrapper.text()).to.contain('Needs: 5 unique tags');
    expect(wrapper.text()).to.contain('Reward: +1 TR');
    expect(wrapper.text()).to.contain('Gains a random new tag');
  });

  it('renders as void, with no content, for a half-card position', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '1 / span 1', isVoid: true},
    });
    expect(wrapper.find('.mutation-market-void').exists()).to.be.true;
    expect(wrapper.text()).to.eq('');
  });

  it('renders a per-player progress counter when the server provides one', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {
        marketSlot: {
          mutation: MutationName.TAG_DIVERSIFIER,
          active: true,
          minimumBid: 2,
          playerProgress: [{color: 'red', score: 3}, {color: 'blue', score: 0}],
        },
        gridColumn: '1 / span 2',
      },
    });
    // One score cell per player (the color-symbol badge is hidden unless the
    // symbol_overlay preference is on, so don't assume it renders here).
    expect(wrapper.findAll('.ma-score').length).to.be.at.least(2);
    expect(wrapper.text()).to.contain('3');
  });

  it('renders no progress counter when the server omits one', () => {
    const wrapper = shallowMount(MutationMarketMutationSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '1 / span 2'},
    });
    expect(wrapper.find('.ma-scores').exists()).to.be.false;
  });

  it('plays and then clears the entrance animation when the mutation is replaced', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = shallowMount(MutationMarketMutationSlot, {
        ...globalConfig,
        props: {marketSlot: slotFor(MutationName.TAG_DIVERSIFIER), gridColumn: '1 / span 2'},
      });
      expect(wrapper.classes()).to.not.include('mutation-market-slot--entering-left');

      await wrapper.setProps({marketSlot: slotFor(MutationName.MINI_MUTATION)});
      expect(wrapper.classes()).to.include('mutation-market-slot--entering-left');

      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).to.not.include('mutation-market-slot--entering-left');
    } finally {
      vi.useRealTimers();
    }
  });
});
