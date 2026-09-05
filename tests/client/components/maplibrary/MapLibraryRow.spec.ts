import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MapLibraryRow from '@/client/components/maplibrary/MapLibraryRow.vue';
import {MapLibraryEntry} from '@/common/boards/MapLibraryEntry';
import {blankCustomBoard} from '@/common/boards/CustomBoardDefinition';
import {encodeCustomBoard} from '@/common/boards/customBoardCodec';
import {OFFICIAL_MAP_LIBRARY_BOARDS, officialMapLibraryId} from '@/common/boards/officialMapLibrary';
import {BoardName} from '@/common/boards/BoardName';

function fanmadeEntry(overrides: Partial<MapLibraryEntry> = {}): MapLibraryEntry {
  return {
    id: 'm1',
    code: encodeCustomBoard(blankCustomBoard(9, 'A Fan Map')),
    description: '',
    submittedBy: '',
    origin: 'fanmade',
    status: 'submitted',
    createdAt: 1000,
    ...overrides,
  };
}

// jsdom refuses to actually navigate (logs "Not implemented: navigation" and leaves
// window.location.href unchanged), so stub `location` with a plain object that just
// records what it was set to -- exactly what the two "play" tests below need to observe.
function stubLocation(): {href: string} {
  const original = window.location;
  const stub = {href: original.href};
  Object.defineProperty(window, 'location', {configurable: true, value: stub});
  return stub;
}

describe('MapLibraryRow', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {configurable: true, value: originalLocation});
    try {
      window.localStorage?.removeItem('customBoardCode');
    } catch (e) { /* ignore */ }
  });

  it('shows the decoded name and description', () => {
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry({description: 'a nice map'})}});
    expect(wrapper.text()).to.contain('A Fan Map');
    expect(wrapper.text()).to.contain('a nice map');
  });

  it('falls back gracefully when the code cannot be decoded', () => {
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry({code: 'not-a-real-code'})}});
    expect(wrapper.find('.map-thumbnail--error').exists()).is.true;
  });

  it('hides admin buttons when not an admin', () => {
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry(), isAdmin: false}});
    expect(wrapper.text()).to.not.contain('Approve');
    expect(wrapper.text()).to.not.contain('Delete');
  });

  it('shows Approve only for a submitted fanmade map when admin', () => {
    const submitted = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry({status: 'submitted'}), isAdmin: true}});
    expect(submitted.text()).to.contain('Approve');
    expect(submitted.text()).to.contain('Delete');

    const approved = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry({status: 'approved'}), isAdmin: true}});
    expect(approved.text()).to.not.contain('Approve');
    expect(approved.text()).to.contain('Delete');
  });

  it('emits approve/delete with the entry id', async () => {
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry: fanmadeEntry({id: 'm42'}), isAdmin: true}});
    await wrapper.find('button.btn:not(.btn-primary):not(.btn-error)').trigger('click');
    expect(wrapper.emitted('approve')).deep.eq([['m42']]);

    await wrapper.find('button.btn-error').trigger('click');
    expect(wrapper.emitted('delete')).deep.eq([['m42']]);
  });

  it('playing a fanmade map stores its code and navigates to customBoard=1', async () => {
    const location = stubLocation();
    const entry = fanmadeEntry();
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry}});
    await wrapper.find('button.btn-primary').trigger('click');
    expect(window.localStorage.getItem('customBoardCode')).eq(entry.code);
    expect(location.href).to.contain('new-game?customBoard=1');
  });

  it('playing an official map navigates with ?board= and does not touch localStorage', async () => {
    const location = stubLocation();
    const {boardName} = OFFICIAL_MAP_LIBRARY_BOARDS[0];
    const officialEntry: MapLibraryEntry = fanmadeEntry({
      id: officialMapLibraryId(boardName),
      code: OFFICIAL_MAP_LIBRARY_BOARDS[0].code,
      origin: 'official',
      status: 'approved',
    });
    window.localStorage.setItem('customBoardCode', 'sentinel-should-not-change');
    const wrapper = mount(MapLibraryRow, {...globalConfig, props: {entry: officialEntry}});
    await wrapper.find('button.btn-primary').trigger('click');
    expect(location.href).to.contain(`new-game?board=${encodeURIComponent(boardName)}`);
    expect(location.href).to.not.contain('customBoard=1');
    expect(window.localStorage.getItem('customBoardCode')).eq('sentinel-should-not-change');
    expect(boardName).eq(BoardName.THARSIS);
  });
});
