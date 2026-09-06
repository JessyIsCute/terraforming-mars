import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MutationMarket from '@/client/components/mutationmarkets/MutationMarket.vue';
import MutationMarketProjectSlot from '@/client/components/mutationmarkets/MutationMarketProjectSlot.vue';
import MutationMarketMutationSlot from '@/client/components/mutationmarkets/MutationMarketMutationSlot.vue';
import {MutationMarketModel} from '@/common/models/MutationMarketModel';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {CardName} from '@/common/cards/CardName';

function fakeMarket(offsetRowIsTop: boolean): MutationMarketModel {
  return {
    projectSlots: [
      undefined,
      {card: {name: CardName.PLANT_EATER}, active: true},
      {card: {name: CardName.ASTEROID}, active: true},
      {card: {name: CardName.BIG_ASTEROID}, active: true},
      {card: {name: CardName.ICE_ASTEROID}, active: true},
      undefined,
    ],
    alignedRow: [
      {mutation: MutationName.TAG_DIVERSIFIER, active: false, minimumBid: 1},
      {mutation: MutationName.GIGANTIC_UNDERTAKINGS, active: true, minimumBid: 2},
      {mutation: MutationName.MINI_MUTATION, active: false, minimumBid: 1},
    ],
    offsetRow: [
      undefined,
      {mutation: MutationName.CITY_PLANNER, active: true, minimumBid: 1},
      {mutation: MutationName.HEAT_BANKER, active: true, minimumBid: 1},
      undefined,
    ],
    offsetRowIsTop,
  };
}

describe('MutationMarket', () => {
  it('mounts without errors when there is no market', () => {
    const wrapper = shallowMount(MutationMarket, {...globalConfig});
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.find('.mutation-market').exists()).to.be.false;
  });

  it('renders 6 project slots and the aligned+offset mutation rows', () => {
    const wrapper = shallowMount(MutationMarket, {
      ...globalConfig,
      props: {market: fakeMarket(false)},
    });
    expect(wrapper.findAllComponents(MutationMarketProjectSlot)).to.have.lengthOf(6);
    // 3 aligned + 4 offset = 7 mutation slot components across the two rows.
    expect(wrapper.findAllComponents(MutationMarketMutationSlot)).to.have.lengthOf(7);
  });

  it('renders the offset row on top when offsetRowIsTop is true', () => {
    const wrapper = shallowMount(MutationMarket, {
      ...globalConfig,
      props: {market: fakeMarket(true)},
    });
    const mutationSlots = wrapper.findAllComponents(MutationMarketMutationSlot);
    // The offset row (4 entries) comes first in the template when it's on top.
    expect(mutationSlots).to.have.lengthOf(7);
    expect(mutationSlots[0].props('marketSlot')?.mutation).to.eq(undefined);
    expect(mutationSlots[1].props('marketSlot')?.mutation).to.eq(MutationName.CITY_PLANNER);
  });

  it('assigns aligned-row mutation slots a 2-column span starting at their doubled index', () => {
    const wrapper = shallowMount(MutationMarket, {
      ...globalConfig,
      props: {market: fakeMarket(false)},
    });
    const mutationSlots = wrapper.findAllComponents(MutationMarketMutationSlot);
    // offsetRowIsTop is false, so the aligned row (3 entries) renders first.
    expect(mutationSlots[0].props('gridColumn')).to.eq('1 / span 2');
    expect(mutationSlots[1].props('gridColumn')).to.eq('3 / span 2');
    expect(mutationSlots[2].props('gridColumn')).to.eq('5 / span 2');
  });

  it('assigns offset-row mutation slots half-width columns at the edges', () => {
    const wrapper = shallowMount(MutationMarket, {
      ...globalConfig,
      props: {market: fakeMarket(true)},
    });
    const mutationSlots = wrapper.findAllComponents(MutationMarketMutationSlot);
    // offsetRowIsTop is true, so the offset row (4 entries) renders first.
    expect(mutationSlots[0].props('gridColumn')).to.eq('1 / span 1');
    expect(mutationSlots[1].props('gridColumn')).to.eq('2 / span 2');
    expect(mutationSlots[2].props('gridColumn')).to.eq('4 / span 2');
    expect(mutationSlots[3].props('gridColumn')).to.eq('6 / span 1');
  });
});
