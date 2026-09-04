import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import GameOverview from '@/client/components/admin/GameOverview.vue';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import {asComplete} from '../utils/models';

describe('GameOverview', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(GameOverview, {
      ...globalConfig,
      props: {
        status: 'loading',
        game: asComplete<SimpleGameModel>({}),
        id: 'game-123',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows the start time and age of a running game', () => {
    const started = Date.now() - (3 * 3600 + 20 * 60) * 1000;
    const wrapper = shallowMount(GameOverview, {
      ...globalConfig,
      props: {
        status: 'done',
        game: asComplete<SimpleGameModel>({players: [], createdTimeMs: started}),
        id: 'game-123',
      },
    });
    const timer = wrapper.find('.game-timer');
    expect(timer.exists()).to.be.true;
    expect(timer.text()).to.match(/3h 20m ago/);
  });

  it('emits "purged" with the game id after a confirmed purge', async () => {
    window.confirm = () => true;
    (window as any).fetch = () => Promise.resolve({ok: true, json: () => Promise.resolve({deleted: 1})});

    const wrapper = shallowMount(GameOverview, {
      ...globalConfig,
      props: {
        status: 'done',
        game: asComplete<SimpleGameModel>({players: [], createdTimeMs: Date.now()}),
        id: 'game-123',
      },
    });

    await wrapper.find('button.btn-error').trigger('click');
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(wrapper.emitted('purged')?.[0]).to.deep.eq(['game-123']);
  });
});
