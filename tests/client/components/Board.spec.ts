import {shallowMount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import Board from '@/client/components/Board.vue';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {DEFAULT_EXPANSIONS} from '@/common/cards/GameModule';
import {BoardName} from '@/common/boards/BoardName';

const spaces: SpaceModel[] = [
  {
    id: '01',
    x: 1,
    y: 1,
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: '02',
    x: 2,
    y: 1,
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: '69',
    x: 3,
    y: 1,
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: '04',
    x: 3,
    y: 1,
    bonus: [],
    spaceType: SpaceType.OCEAN,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
];


describe('Board', () => {
  it('has visible tiles on the board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'hide', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    const boardSpacesWrappers = wrapper.findAllComponents(BoardSpace).filter((wrapper) => {
      return wrapper.attributes('data-test') === 'board-space';
    });

    expect(
      boardSpacesWrappers.every((wrapper) => wrapper.props('tileView') === 'hide'),
    ).to.be.true;
  });

  it('has hidden tiles on the board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    const boardSpacesWrappers = wrapper.findAllComponents(BoardSpace).filter((wrapper) => {
      return wrapper.attributes('data-test') === 'board-space';
    });

    expect(
      boardSpacesWrappers.every((wrapper) => wrapper.props('tileView') === 'show'),
    ).to.be.true;
  });

  it('emits toggleTileView on toggle button click', async () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    await wrapper.find('[data-test=hide-tiles-button]').trigger('click');
    expect(wrapper.emitted('toggleTileView')?.length).to.be.eq(1);
  });

  it('renders "show tiles" in toggle button if tiles are hidden', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    expect(wrapper.find('[data-test=hide-tiles-button]').text()).to.be.eq('show tiles');
  });

  it('renders "hide tiles" in toggle button if tiles are visible', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'hide', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    expect(wrapper.find('[data-test=hide-tiles-button]').text()).to.be.eq('hide tiles');
  });

  const customSpaces: SpaceModel[] = [
    {id: '100', x: 4, y: 0, bonus: [], spaceType: SpaceType.LAND, color: undefined, highlight: undefined, tileType: undefined},
    {id: '101', x: 2, y: 2, bonus: [], spaceType: SpaceType.OCEAN, color: undefined, highlight: undefined, tileType: undefined},
    {id: '102', x: 5, y: 4, bonus: [], spaceType: SpaceType.RESTRICTED, color: undefined, highlight: undefined, tileType: undefined},
  ];
  const stretched = {
    temperature: {min: -40, max: 20, step: 2, bonuses: []},
    oxygen: {min: 0, max: 20, step: 1, bonuses: []},
    venus: {min: 0, max: 30, step: 2, bonuses: []},
    oceans: {max: 12},
    heatForTemperature: 8,
  };

  it('positions custom-board spaces by pixel', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces: customSpaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.CUSTOM},
    });
    expect(wrapper.find('#board_legend').exists()).to.be.false;

    const spaceWrappers = wrapper.findAllComponents(BoardSpace)
      .filter((w) => w.attributes('data-test') === 'board-space');
    expect(spaceWrappers).to.have.length(3);
    expect(spaceWrappers.every((w) => w.props('pixel') !== undefined)).to.be.true;
    // maxY is 4, so the middle row is y=2 (zero row-shift): left === 49*x + 6.
    const middle = spaceWrappers.find((w) => w.props('space').id === '101')!;
    expect(middle.props('pixel')).to.deep.eq({left: 49 * 2 + 6, top: 34 + 41 * 2});
    const bottom = spaceWrappers.find((w) => w.props('space').id === '102')!;
    expect(bottom.props('pixel')).to.deep.eq({left: 49 * 5 + 6 - 49, top: 34 + 41 * 4});
  });

  it('keeps the painted Mars + curved tracks for a custom board on standard parameters', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces: customSpaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.CUSTOM},
    });
    expect(wrapper.find('.board-without-venus').exists()).to.be.true;
    expect(wrapper.find('.board-cont--custom').exists()).to.be.false;
    expect(wrapper.find('.global-numbers--custom').exists()).to.be.false;
    // The hex grid is transformed to fit the painted diamond.
    expect(wrapper.find('#main_board').attributes('style') ?? '').to.match(/scale\(/);
  });

  it('drops the painting for a plain readout when parameters are stretched', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces: customSpaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.CUSTOM, globalParameters: stretched},
    });
    expect(wrapper.find('.board-cont--custom').exists()).to.be.true;
    expect(wrapper.find('.board-with-venus').exists()).to.be.false;
    expect(wrapper.find('.board-without-venus').exists()).to.be.false;
    expect(wrapper.find('.global-numbers--custom').exists()).to.be.true;
  });
});
