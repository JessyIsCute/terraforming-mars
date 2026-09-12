import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import GameSetupDetail from '@/client/components/GameSetupDetail.vue';
import {fakeGameOptionsModel} from './testHelpers';

describe('GameSetupDetail', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(GameSetupDetail, {
      ...globalConfig,
      props: {
        playerNumber: 2,
        gameOptions: fakeGameOptionsModel(),
        lastSoloGeneration: 14,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows an icon for every fan expansion, not just the official ones', () => {
    const wrapper = shallowMount(GameSetupDetail, {
      ...globalConfig,
      props: {
        playerNumber: 2,
        gameOptions: fakeGameOptionsModel({
          expansions: {
            sillyfication: true,
            betterMars: true,
            customCards: true,
            mutationMarkets: true,
            conglomerates: true,
            blackMarket: true,
            corporateBetterments: true,
            idesOfMars: true,
            robAntilles: true,
          },
        }),
        lastSoloGeneration: 14,
      },
    });

    for (const expansion of ['sillyfication', 'betterMars', 'customCards', 'mutationMarkets',
      'conglomerates', 'blackMarket', 'corporateBetterments', 'idesOfMars', 'robAntilles']) {
      expect(wrapper.find(`.expansion-icon-${expansion}`).exists(), expansion).to.be.true;
    }
  });
});
