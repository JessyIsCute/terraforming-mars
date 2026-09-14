import {mount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import SimpleMapEditor from '@/client/components/SimpleMapEditor.vue';
import {decodeSimpleBoard, encodeSimpleBoard} from '@/common/boards/simpleBoardCodec';
import {blankSimpleBoard} from '@/common/boards/SimpleCustomBoardDefinition';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceBonus} from '@/common/boards/SpaceBonus';

describe('SimpleMapEditor', () => {
  it('links back to the Mars editor and to the other simple board type', () => {
    const venus = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    let links = venus.findAll('.simple-map-editor-board-nav a').map((a) => a.attributes('href'));
    expect(links).to.include('map-editor');
    expect(links).to.include('map-editor?board=moon');

    const moon = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    links = moon.findAll('.simple-map-editor-board-nav a').map((a) => a.attributes('href'));
    expect(links).to.include('map-editor');
    expect(links).to.include('map-editor?board=venus');
  });

  it('mounts a Venus board with 37 hexes and a valid code', () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    const hexes = wrapper.findAll('.simple-map-editor-hex');
    expect(hexes.length).to.eq(37);
    const code = (wrapper.vm as any).code as string;
    expect(code.startsWith('TMBS1')).to.be.true;
    const decoded = decodeSimpleBoard(code);
    expect(decoded.boardType).to.eq('venusPhase2');
    expect(decoded.spaces).to.have.length(37);
  });

  it('mounts a Moon board with 35 hexes', () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    expect(wrapper.findAll('.simple-map-editor-hex').length).to.eq(35);
    const decoded = decodeSimpleBoard((wrapper.vm as any).code);
    expect(decoded.boardType).to.eq('moon');
    expect(decoded.spaces).to.have.length(35);
  });

  it('does not offer a bonus palette for Venus (no bonus concept on that board today)', () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    expect(wrapper.text()).to.not.include('Bonuses');
  });

  it('offers a bonus palette for Moon', () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    expect(wrapper.text()).to.include('Bonuses');
  });

  it('painting a hex changes its type in the generated code (Venus: land -> gaslight)', async () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    (wrapper.vm as any).tool = 'type:' + SpaceType.GASLIGHT;
    await wrapper.vm.$nextTick();
    await wrapper.findAll('.simple-map-editor-hex')[0].trigger('click');
    const decoded = decodeSimpleBoard((wrapper.vm as any).code);
    expect(decoded.spaces[0].spaceType).to.eq(SpaceType.GASLIGHT);
  });

  it('painting a bonus on Moon stacks bonuses, right-click removes the last one', async () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    (wrapper.vm as any).tool = 'bonus:' + SpaceBonus.STEEL;
    await wrapper.vm.$nextTick();
    const hex = wrapper.findAll('.simple-map-editor-hex')[0];
    await hex.trigger('click');
    await hex.trigger('click');
    expect(decodeSimpleBoard((wrapper.vm as any).code).spaces[0].bonus).to.deep.eq([SpaceBonus.STEEL, SpaceBonus.STEEL]);

    await hex.trigger('contextmenu');
    expect(decodeSimpleBoard((wrapper.vm as any).code).spaces[0].bonus).to.deep.eq([SpaceBonus.STEEL]);
  });

  it('Load rebuilds the editor from a pasted code', async () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    const source = blankSimpleBoard('venusPhase2', 'Loaded Venus');
    source.spaces[0].spaceType = SpaceType.GASLIGHT;

    (wrapper.vm as any).loadInput = encodeSimpleBoard(source);
    (wrapper.vm as any).loadCode();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).name).to.eq('Loaded Venus');
    expect(decodeSimpleBoard((wrapper.vm as any).code)).to.deep.eq(source);
  });

  it('Load rejects a code for the wrong board type instead of silently adopting it', async () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    const wrongBoard = blankSimpleBoard('moon', 'Wrong Board');

    (wrapper.vm as any).loadInput = encodeSimpleBoard(wrongBoard);
    (wrapper.vm as any).loadCode();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).loadError).to.not.eq('');
    expect((wrapper.vm as any).name).to.not.eq('Wrong Board');
  });

  it('the export source has one b.row(...) line per grid row and reflects painted types', () => {
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    const source = (wrapper.vm as any).exportSource as string;
    const lines = source.split('\n');
    expect(lines).to.have.length(7); // Venus's own hexRowLayout has 7 rows (side length 4).
    expect(lines[0]).to.match(/^b\.row\(\d+\)(\.land\(\)){4};$/);
  });

  it('renders the real board preview component for the given board type', () => {
    const venus = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'venusPhase2'}});
    expect(venus.findComponent({name: 'VenusSurfaceBoard'}).exists()).is.true;

    const moon = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    expect(moon.findComponent({name: 'MoonBoard'}).exists()).is.true;
  });

  it('gives the Moon preview real m-prefixed ids MoonBoard.vue positions by CSS, not generic ones', () => {
    // MoonBoard.vue's template positions every grid hex via hand-tuned CSS keyed to its exact id
    // ('.moon-space-m02'..'.moon-space-m36' in moon.less) -- a generic id (customSpaceId's
    // Mars-style '100', '101'...) matches no CSS rule, so every hex silently falls back to its
    // default position and they all stack on top of each other. Unlike Venus's board, which
    // positions generically by (x, y) and doesn't care what the ids are.
    const wrapper = mount(SimpleMapEditor, {...globalConfig, props: {boardType: 'moon'}});
    const model = (wrapper.vm as any).previewMoonModel;
    const gridSpaceIds: Array<string> = model.spaces
      .filter((s: any) => s.spaceType !== SpaceType.COLONY)
      .map((s: any) => s.id);
    expect(gridSpaceIds).to.have.length(35);
    expect(gridSpaceIds.every((id) => /^m\d{2}$/.test(id))).is.true;
    // Matches MoonBoard.ts's own real numbering exactly (m01 reserved for Luna Trade Station).
    expect(gridSpaceIds[0]).to.eq('m02');
    expect(gridSpaceIds[gridSpaceIds.length - 1]).to.eq('m36');
  });
});
