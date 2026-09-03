import {mount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import MapEditor from '@/client/components/MapEditor.vue';
import {decodeCustomBoard, encodeCustomBoard} from '@/common/boards/customBoardCodec';
import {blankCustomBoard} from '@/common/boards/CustomBoardDefinition';
import {SpaceType} from '@/common/boards/SpaceType';

describe('MapEditor', () => {
  it('mounts with a full 9-row hexagon and a valid code', () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const hexes = wrapper.findAll('.map-editor-hex');
    expect(hexes.length).to.eq(61);
    const code = (wrapper.vm as any).code as string;
    expect(code.startsWith('TMB2')).to.be.true;
    expect(decodeCustomBoard(code).spaces).to.have.length(61);
  });

  it('painting a hex changes its type in the generated code', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    // Default tool is 'type:ocean'.
    await wrapper.findAll('.map-editor-hex')[0].trigger('click');
    const decoded = decodeCustomBoard((wrapper.vm as any).code);
    expect(decoded.spaces[0].spaceType).to.eq(SpaceType.OCEAN);
  });

  it('the void tool removes a space from the definition', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    (wrapper.vm as any).tool = 'flag:void';
    await wrapper.vm.$nextTick();
    await wrapper.findAll('.map-editor-hex')[0].trigger('click');
    expect(decodeCustomBoard((wrapper.vm as any).code).spaces).to.have.length(60);
  });

  it('Load rebuilds the editor from a pasted code', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const source = blankCustomBoard(5, 'Loaded');
    source.spaces[0].spaceType = SpaceType.OCEAN;

    (wrapper.vm as any).loadInput = encodeCustomBoard(source);
    (wrapper.vm as any).loadCode();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).rows).to.eq(5);
    expect((wrapper.vm as any).name).to.eq('Loaded');
    expect(wrapper.findAll('.map-editor-hex').length).to.eq(19);
    expect(decodeCustomBoard((wrapper.vm as any).code)).to.deep.eq(source);
  });

  it('caps milestone selection at 5', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.milestones = ['Terraformer', 'Mayor', 'Gardener', 'Planner', 'Builder'];
    await wrapper.vm.$nextTick();
    const disabled = wrapper.findAll('.map-editor-ma input[type=checkbox]')
      .filter((c) => (c.element as HTMLInputElement).disabled);
    // All unchecked milestone boxes are disabled once 5 are chosen.
    expect(disabled.length).to.be.greaterThan(0);
  });
});
