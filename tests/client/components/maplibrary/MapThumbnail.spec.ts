import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MapThumbnail from '@/client/components/maplibrary/MapThumbnail.vue';
import {blankCustomBoard} from '@/common/boards/CustomBoardDefinition';

describe('MapThumbnail', () => {
  it('renders one hex per space', () => {
    const definition = blankCustomBoard(3, 'Tiny');
    const wrapper = mount(MapThumbnail, {...globalConfig, props: {definition}});
    expect(wrapper.findAll('.map-thumbnail-hex').length).eq(definition.spaces.length);
  });

  it('does not throw for a board with no spaces', () => {
    const definition = {...blankCustomBoard(3, 'Empty'), spaces: []};
    const wrapper = mount(MapThumbnail, {...globalConfig, props: {definition}});
    expect(wrapper.findAll('.map-thumbnail-hex').length).eq(0);
  });
});
