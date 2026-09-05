import {expect} from 'chai';
import {seedOfficialMapLibrary} from '../../src/server/database/seedOfficialMapLibrary';
import {OFFICIAL_MAP_LIBRARY_BOARDS, officialMapLibraryId} from '../../src/common/boards/officialMapLibrary';
import {decodeCustomBoard} from '../../src/common/boards/customBoardCodec';
import {InMemoryDatabase} from '../testing/InMemoryDatabase';
import {restoreTestDatabase, setTestDatabase} from '../testing/setup';

describe('seedOfficialMapLibrary', () => {
  afterEach(() => {
    restoreTestDatabase();
  });

  it('inserts one approved, official entry per official board', async () => {
    const db = new InMemoryDatabase();
    setTestDatabase(db);

    await seedOfficialMapLibrary();

    const entries = await db.listMapLibraryEntries();
    expect(entries.length).eq(OFFICIAL_MAP_LIBRARY_BOARDS.length);
    for (const entry of entries) {
      expect(entry.origin).eq('official');
      expect(entry.status).eq('approved');
      // Every official code must still decode.
      expect(() => decodeCustomBoard(entry.code)).to.not.throw();
    }
  });

  it('is idempotent -- re-seeding does not duplicate existing rows', async () => {
    const db = new InMemoryDatabase();
    setTestDatabase(db);

    await seedOfficialMapLibrary();
    await seedOfficialMapLibrary();

    expect((await db.listMapLibraryEntries()).length).eq(OFFICIAL_MAP_LIBRARY_BOARDS.length);
  });

  it('does not resurrect a row an admin deleted, until the next seed call (boot)', async () => {
    const db = new InMemoryDatabase();
    setTestDatabase(db);
    await seedOfficialMapLibrary();

    const {boardName} = OFFICIAL_MAP_LIBRARY_BOARDS[0];
    const id = officialMapLibraryId(boardName);
    await db.deleteMapLibraryEntry(id);
    expect(await db.getMapLibraryEntry(id)).is.undefined;

    // Simulating the next server boot: the deleted official row comes back, by design.
    await seedOfficialMapLibrary();
    expect(await db.getMapLibraryEntry(id)).is.not.undefined;
  });
});
