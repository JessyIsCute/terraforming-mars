import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import BlackMarket from '@/client/components/blackmarket/BlackMarket.vue';
import {CardName} from '@/common/cards/CardName';

describe('BlackMarket', () => {
  it('renders nothing when there is no market', () => {
    const wrapper = shallowMount(BlackMarket, {...globalConfig});
    expect(wrapper.find('.black-market').exists()).to.be.false;
  });

  it('always renders the early row, one slot per card', () => {
    const wrapper = shallowMount(BlackMarket, {
      ...globalConfig,
      props: {
        market: {
          early: [
            {name: CardName.SMUGGLED_REACTOR_CORE},
            {name: CardName.STOLEN_BLUEPRINTS},
            undefined,
            undefined,
          ],
          mid: undefined,
          late: undefined,
        },
      },
    });
    expect(wrapper.findAllComponents({name: 'BlackMarketSlot'})).to.have.lengthOf(4);
    expect(wrapper.findAll('.black-market-row')).to.have.lengthOf(1);
  });

  it('renders the mid row once unlocked, and the late row only once that unlocks too', () => {
    const wrapper = shallowMount(BlackMarket, {
      ...globalConfig,
      props: {
        market: {
          early: [{name: CardName.SMUGGLED_REACTOR_CORE}, undefined, undefined, undefined],
          mid: [{name: CardName.ORE_FOR_OXYGEN_RACKET}, undefined, undefined, undefined],
          late: undefined,
        },
      },
    });
    expect(wrapper.findAll('.black-market-row')).to.have.lengthOf(2);
    expect(wrapper.findAllComponents({name: 'BlackMarketSlot'})).to.have.lengthOf(8);
  });
});
