import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import PlayerResources from '@/client/components/overview/PlayerResources.vue';
import {fakePublicPlayerModel} from '../testHelpers';

describe('PlayerResources', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(PlayerResources, {
      ...globalConfig,
      props: {
        player: fakePublicPlayerModel(),
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows a Coordination resource box with a +2 production hint when Conglomerates is on', () => {
    const wrapper = shallowMount(PlayerResources, {
      ...globalConfig,
      props: {
        player: fakePublicPlayerModel({conglomeratesData: {coordination: 5}}),
        conglomeratesExpansion: true,
      },
    });

    const box = wrapper.find('[data-test="coordination-resource"]');
    expect(box.exists()).to.be.true;
    expect(box.find('[data-test="stock-count"]').text()).to.eq('5');
    expect(box.find('[data-test="production"]').text()).to.eq('+2');
  });

  it('does not show a Coordination resource box when Conglomerates is off', () => {
    const wrapper = shallowMount(PlayerResources, {
      ...globalConfig,
      props: {
        player: fakePublicPlayerModel(),
      },
    });

    expect(wrapper.find('[data-test="coordination-resource"]').exists()).to.be.false;
  });
});
