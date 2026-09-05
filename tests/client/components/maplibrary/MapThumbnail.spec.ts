import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MapThumbnail from '@/client/components/maplibrary/MapThumbnail.vue';
import {blankCustomBoard} from '@/common/boards/CustomBoardDefinition';
import {SpaceBonus} from '@/common/boards/SpaceBonus';

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

  it('renders a bonus icon for each placement bonus on a space', () => {
    const definition = blankCustomBoard(3, 'Bonuses');
    definition.spaces[0].bonus = [SpaceBonus.PLANT, SpaceBonus.STEEL];
    const wrapper = mount(MapThumbnail, {...globalConfig, props: {definition}});
    expect(wrapper.findAll('.map-thumbnail-hex-bonus').length).eq(2);
    expect(wrapper.find('.board-space-bonus--plant').exists()).is.true;
    expect(wrapper.find('.board-space-bonus--steel').exists()).is.true;
  });

  it('renders a Mars backdrop behind the hexes', () => {
    const definition = blankCustomBoard(9, 'Standard');
    const wrapper = mount(MapThumbnail, {...globalConfig, props: {definition}});
    const style = (wrapper.find('.map-thumbnail-inner').element as HTMLElement).style;
    expect(style.background).to.contain('mars-without-venus.png');
  });

  it('defaults to a 160x130 box, and honors explicit width/height props', () => {
    const definition = blankCustomBoard(9, 'Standard');
    const defaultSize = mount(MapThumbnail, {...globalConfig, props: {definition}});
    const defaultStyle = (defaultSize.find('.map-thumbnail').element as HTMLElement).style;
    expect(defaultStyle.width).eq('160px');
    expect(defaultStyle.height).eq('130px');

    const bigger = mount(MapThumbnail, {...globalConfig, props: {definition, width: 300, height: 230}});
    const biggerStyle = (bigger.find('.map-thumbnail').element as HTMLElement).style;
    expect(biggerStyle.width).eq('300px');
    expect(biggerStyle.height).eq('230px');
  });
});
