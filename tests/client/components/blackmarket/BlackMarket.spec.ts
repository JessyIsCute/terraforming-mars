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

  it('renders one slot per market card', () => {
    const wrapper = shallowMount(BlackMarket, {
      ...globalConfig,
      props: {
        market: {
          slots: [
            {card: {name: CardName.SMUGGLED_REACTOR_CORE}, price: {titanium: 2}},
            {card: {name: CardName.STOLEN_BLUEPRINTS}, price: {steel: 2}},
            undefined,
            undefined,
            undefined,
          ],
        },
      },
    });
    expect(wrapper.findAllComponents({name: 'BlackMarketSlot'})).to.have.lengthOf(5);
  });
});
