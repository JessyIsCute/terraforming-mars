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
    expect(code.startsWith('TMB3')).to.be.true;
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

  it('Load preserves void cells (does not re-fill carved holes with land)', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const source = blankCustomBoard(9, 'Carved');
    // Drop two cells and renumber to what the codec produces.
    source.spaces.splice(5, 1);
    source.spaces.splice(20, 1);
    source.spaces.forEach((s, i) => (s.id = blankCustomBoard(9, '').spaces[i].id));

    (wrapper.vm as any).loadInput = encodeCustomBoard(source);
    (wrapper.vm as any).loadCode();
    await wrapper.vm.$nextTick();

    const reencoded = decodeCustomBoard((wrapper.vm as any).code);
    expect(reencoded.spaces).to.have.length(59);
    expect(reencoded).to.deep.eq(source);
  });

  it('separates terrain, markers and placement bonuses, with descriptions', () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const legends = wrapper.findAll('.map-editor-tools legend').map((l) => l.text());
    expect(legends).to.include.members(['Terrain', 'Markers', 'Placement bonuses']);
    // Every tool label carries a description tooltip.
    const toolLabels = wrapper.findAll('.map-editor-tools label');
    expect(toolLabels.length).to.be.greaterThan(10);
    expect(toolLabels.every((l) => (l.attributes('title') ?? '').length > 10)).to.be.true;
  });

  it('renders bonus tools with the real board sprite classes, not emoji', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const icons = wrapper.findAll('.map-editor-bonus-icon');
    expect(icons.length).to.be.greaterThan(5);
    expect(icons.some((i) => i.classes().includes('board-space-bonus--heat'))).to.be.true;
    expect(icons.some((i) => i.classes().includes('board-space-bonus--card'))).to.be.true;

    // A painted hex shows a sprite element, not a text glyph.
    (wrapper.vm as any).tool = 'bonus:' + 4; // HEAT
    await wrapper.vm.$nextTick();
    await wrapper.findAll('.map-editor-hex')[0].trigger('click');
    const hexBonus = wrapper.findAll('.map-editor-hex')[0].find('.map-editor-hex-bonus');
    expect(hexBonus.exists()).to.be.true;
    expect(hexBonus.classes()).to.include('board-space-bonus--heat');
  });

  it('stacks placement bonuses in any combination', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const vm = wrapper.vm as any;
    const hex = () => wrapper.findAll('.map-editor-hex')[0];

    vm.tool = 'bonus:' + 2; // PLANT
    await wrapper.vm.$nextTick();
    await hex().trigger('click');
    await hex().trigger('click'); // two plants
    vm.tool = 'bonus:' + 4; // HEAT
    await wrapper.vm.$nextTick();
    await hex().trigger('click');

    let space = decodeCustomBoard(vm.code).spaces[0];
    expect(space.bonus).to.deep.eq([2, 2, 4]);

    // Right-click removes the last one.
    await hex().trigger('contextmenu');
    space = decodeCustomBoard(vm.code).spaces[0];
    expect(space.bonus).to.deep.eq([2, 2]);

    // Clear tool empties the hex.
    vm.tool = 'bonus:clear';
    await wrapper.vm.$nextTick();
    await hex().trigger('click');
    expect(decodeCustomBoard(vm.code).spaces[0].bonus).to.deep.eq([]);
  });

  it('paints terrain with the real board sprite classes', async () => {
    const wrapper = mount(MapEditor, {...globalConfig});
    const vm = wrapper.vm as any;
    const hex = () => wrapper.findAll('.map-editor-hex')[0];

    vm.tool = 'type:ocean';
    await wrapper.vm.$nextTick();
    await hex().trigger('click');
    expect(hex().classes()).to.include('board-space-type-ocean');

    vm.tool = 'flag:volcanic';
    await wrapper.vm.$nextTick();
    vm.tool = 'type:land';
    await wrapper.vm.$nextTick();
    await hex().trigger('click'); // land, not volcanic yet
    vm.tool = 'flag:volcanic';
    await wrapper.vm.$nextTick();
    await hex().trigger('click');
    expect(hex().classes()).to.include.members(['board-space-type-land', 'board-space-type-land-volcanic']);

    vm.tool = 'flag:void';
    await wrapper.vm.$nextTick();
    await hex().trigger('click');
    expect(hex().classes()).to.include('map-editor-hex--void');
    expect(hex().classes()).to.not.include('board-space-type-land');
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
