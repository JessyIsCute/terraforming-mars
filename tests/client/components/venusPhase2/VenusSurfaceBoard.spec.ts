import {mount} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import {expect} from 'chai';
import VenusSurfaceBoard from '@/client/components/venusPhase2/VenusSurfaceBoard.vue';
import {VenusPhase2Model} from '@/common/models/VenusPhase2Model';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceId} from '@/common/Types';

function space(id: SpaceId, x: number, y: number, spaceType: SpaceType = SpaceType.LAND) {
  return {id, x, y, spaceType, bonus: []};
}

describe('VenusSurfaceBoard', () => {
  it('draws a leader-line legend entry for Stratopolis and Maxwell Base when on-grid', () => {
    const model: VenusPhase2Model = {
      spaces: [
        space('100', 0, 0),
        space('298', 1, 0, SpaceType.COLONY), // Stratopolis
        space('299', 2, 0, SpaceType.COLONY), // Maxwell Base
      ],
    };
    const wrapper = mount(VenusSurfaceBoard, {
      ...globalConfig,
      props: {model},
    });

    const legend = wrapper.find('.venus-board-legend');
    expect(legend.exists()).to.be.true;
    expect(legend.findAll('g')).to.have.lengthOf(2);
    expect(legend.text()).to.include('Stratopolis');
    expect(legend.text()).to.include('Maxwell');
    expect(legend.text()).to.include('Base');
    // No on-hex text for on-grid reserved spaces anymore -- only the legend labels them.
    expect(wrapper.find('.board-space-text').exists()).to.be.false;
  });

  it('falls back to a plain on-hex label in the off-grid outer-spaces tray', () => {
    const model: VenusPhase2Model = {
      spaces: [
        space('100', 0, 0),
        space('298', -1, -1, SpaceType.COLONY), // Stratopolis, off-grid fallback
      ],
    };
    const wrapper = mount(VenusSurfaceBoard, {
      ...globalConfig,
      props: {model},
    });

    expect(wrapper.find('.venus-board-legend').exists()).to.be.false;
    expect(wrapper.find('.venus-board-outer-spaces .board-space-text').text()).to.eq('Stratopolis');
  });

  it('omits the legend entirely when neither reserved space is on-grid', () => {
    const model: VenusPhase2Model = {
      spaces: [space('100', 0, 0)],
    };
    const wrapper = mount(VenusSurfaceBoard, {
      ...globalConfig,
      props: {model},
    });

    expect(wrapper.find('.venus-board-legend').exists()).to.be.false;
  });

  it('renders a 0-15 and a 15-30 scale track row, highlighting the current value', () => {
    const model: VenusPhase2Model = {spaces: [space('100', 0, 0)]};
    const wrapper = mount(VenusSurfaceBoard, {
      ...globalConfig,
      props: {model, venusScaleLevel: 7},
    });

    const rows = wrapper.findAll('.venus-scale-track-row');
    expect(rows).to.have.lengthOf(2);
    expect(rows[0].findAll('.venus-scale-tick')).to.have.lengthOf(16);
    expect(rows[1].findAll('.venus-scale-tick')).to.have.lengthOf(16);

    const current = wrapper.findAll('.venus-scale-tick--current');
    expect(current).to.have.lengthOf(1);
    expect(current[0].text()).to.eq('7');
  });

  it('highlights the shared boundary value (15) in both rows, since both legitimately show it', () => {
    const model: VenusPhase2Model = {spaces: [space('100', 0, 0)]};
    const wrapper = mount(VenusSurfaceBoard, {
      ...globalConfig,
      props: {model, venusScaleLevel: 15},
    });

    const rows = wrapper.findAll('.venus-scale-track-row');
    expect(rows[0].findAll('.venus-scale-tick--current')).to.have.lengthOf(1);
    expect(rows[1].findAll('.venus-scale-tick--current')).to.have.lengthOf(1);
  });
});
