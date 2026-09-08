import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {vi} from 'vitest';
import {globalConfig} from '../getLocalVue';
import MutationMarketProjectSlot from '@/client/components/mutationmarkets/MutationMarketProjectSlot.vue';
import {MutationMarketProjectSlotModel} from '@/common/models/MutationMarketModel';
import {CardName} from '@/common/cards/CardName';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';

function slotFor(name: CardName, overrides: Partial<MutationMarketProjectSlotModel & object> = {}): MutationMarketProjectSlotModel {
  return {
    card: {name},
    active: true,
    minimumBid: 4,
    coveringMutationsAbove: [],
    coveringMutationsBelow: [],
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
  });

  // Unlike the mutation cards, project cards show no grey inactive overlay at all -- a
  // preview (inactive) slot's card renders exactly like an active one.
  it('renders no grey overlay for a preview (inactive) slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {active: false})},
    });
    expect(wrapper.find('.mutation-market-inactive-overlay').exists()).to.be.false;
  });

  it('previews a mutation covering from below the project row', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {coveringMutationsBelow: [{kind: 'mutation', mutation: MutationName.MINI_MUTATION}]})},
    });
    const badges = wrapper.findAll('.mutation-market-preview-badge');
    expect(badges).to.have.lengthOf(1);
    expect(badges[0].text()).to.eq(MutationName.MINI_MUTATION);
    expect(badges[0].classes()).to.include('mutation-glow');
  });

  it('previews a mutation covering from above the project row, in the same badge row as one from below', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {coveringMutationsAbove: [{kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}]})},
    });
    const badges = wrapper.findAll('.mutation-market-preview-badge');
    expect(badges).to.have.lengthOf(1);
    expect(badges[0].text()).to.eq(MutationName.TAG_DIVERSIFIER);
  });

  it('previews both covering mutations for a doubly-covered slot, side by side in one row', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {
        coveringMutationsAbove: [{kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}],
        coveringMutationsBelow: [{kind: 'mutation', mutation: MutationName.MINI_MUTATION}],
      })},
    });
    expect(wrapper.findAll('.mutation-market-preview-badges')).to.have.lengthOf(1);
    const badges = wrapper.findAll('.mutation-market-preview-badge');
    expect(badges.map((b) => b.text())).to.deep.eq([MutationName.TAG_DIVERSIFIER, MutationName.MINI_MUTATION]);
  });

  it('previews a covering infection with a red glow badge, distinct from a green mutation badge', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {
        coveringMutationsAbove: [{kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}],
        coveringMutationsBelow: [{kind: 'infection', infection: InfectionName.POWER_DRAIN}],
      })},
    });
    const badges = wrapper.findAll('.mutation-market-preview-badge');

    expect(badges[0].text()).to.eq(MutationName.TAG_DIVERSIFIER);
    expect(badges[0].classes()).to.include('mutation-glow');

    expect(badges[1].text()).to.eq(InfectionName.POWER_DRAIN);
    expect(badges[1].classes()).to.include('infection-glow');
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
    expect(wrapper.find('.mutation-market-minimum-bid-coin').exists()).to.be.false;
  });

  it('shows the fixed minimum bid, as an M€ coin, on an active slot with no auction yet', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {minimumBid: 3})},
    });
    const coin = wrapper.find('.mutation-market-minimum-bid-coin');
    expect(coin.exists()).to.be.true;
    expect(coin.text()).to.eq('3');
    expect(wrapper.find('.mutation-market-auction-badge').exists()).to.be.false;
  });

  it('shows no minimum bid coin for an inactive preview slot', () => {
    const wrapper = shallowMount(MutationMarketProjectSlot, {
      ...globalConfig,
      props: {marketSlot: slotFor(CardName.PLANT_EATER, {active: false})},
    });
    expect(wrapper.find('.mutation-market-minimum-bid-coin').exists()).to.be.false;
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
