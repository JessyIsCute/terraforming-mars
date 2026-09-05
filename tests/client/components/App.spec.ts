import {flushPromises, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '@tests/client/components/getLocalVue';
import App from '@/client/components/App.vue';

// Every screen is a defineAsyncComponent, so mounting App kicks off a real dynamic import (and,
// for StartScreen, a further chain of its own static imports). Let that fully settle before the
// test run's environment tears down, or a late resolution surfaces as an unrelated
// "EnvironmentTeardownError" unhandled rejection. flushPromises() alone only drains microtasks;
// the module transform work needs at least one macrotask tick too.
async function settleAsyncComponents(): Promise<void> {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 100));
  await flushPromises();
}

describe('App', () => {
  afterEach(async () => {
    await settleAsyncComponents();
    history.pushState({}, '', '/');
  });

  it('mounts without errors', async () => {
    const wrapper = shallowMount(App, globalConfig);
    expect(wrapper.exists()).to.be.true;
    await settleAsyncComponents();
  });

  it('routes /map-library to the map-library screen', async () => {
    history.pushState({}, '', '/map-library');
    const wrapper = shallowMount(App, globalConfig);
    expect((wrapper.vm as any).screen).eq('map-library');
    await settleAsyncComponents();
  });
});
