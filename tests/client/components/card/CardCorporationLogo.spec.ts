import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardCorporationLogo from '@/client/components/card/CardCorporationLogo.vue';
import {CardName} from '@/common/cards/CardName';

describe('CardCorporationLogo', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardCorporationLogo, {
      ...globalConfig,
      props: {
        title: CardName.ECOLINE,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the Nereid Biosystems bespoke logo', () => {
    const wrapper = shallowMount(CardCorporationLogo, {
      ...globalConfig,
      props: {
        title: CardName.NEREID_BIOSYSTEMS,
      },
    });
    expect(wrapper.find('.card-nereid-biosystems-logo').exists()).to.be.true;
    expect(wrapper.find('.word-1').text()).to.eq('NEREID');
    expect(wrapper.find('.word-2').text()).to.eq('BIOSYSTEMS');
  });
});
