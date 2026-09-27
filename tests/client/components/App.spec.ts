import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '@tests/client/components/getLocalVue';
import App from '@/client/components/App.vue';

const appConfig = {
  ...globalConfig,
  global: {
    ...globalConfig.global,
    // Explicit components avoid starting asynchronous imports.
    stubs: {
      StartScreen: {template: '<div data-test="start-screen"></div>'},
      MapLibrary: {template: '<div data-test="map-library"></div>'},
    },
  },
};

describe('App', () => {
  afterEach(() => {
    history.pushState({}, '', '/');
  });

  it('routes / to the start screen', async () => {
    history.pushState({}, '', '/');
    const wrapper = shallowMount(App, appConfig);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="start-screen"]').exists()).to.be.true;
  });

  it('routes /map-library to the map-library screen', async () => {
    history.pushState({}, '', '/map-library');
    const wrapper = shallowMount(App, appConfig);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="map-library"]').exists()).to.be.true;
  });
});
