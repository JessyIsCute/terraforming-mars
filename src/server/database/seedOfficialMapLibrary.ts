import {Database} from './Database';
import {OFFICIAL_MAP_LIBRARY_BOARDS, officialMapLibraryId} from '../../common/boards/officialMapLibrary';

/**
 * Seeds the Map Library with an 'official'/'approved' entry for every official board, if one
 * doesn't already exist. Safe to call on every server boot: the deterministic id
 * (`officialMapLibraryId`) makes this idempotent, and an admin who deletes an official row won't
 * have it silently resurrected until the next boot -- an acceptable, explicit "restore defaults".
 */
export async function seedOfficialMapLibrary(): Promise<void> {
  const db = Database.getInstance();
  for (const {boardName, code} of OFFICIAL_MAP_LIBRARY_BOARDS) {
    const id = officialMapLibraryId(boardName);
    const existing = await db.getMapLibraryEntry(id);
    if (existing === undefined) {
      await db.insertMapLibraryEntry({
        id,
        code,
        description: '',
        submittedBy: '',
        origin: 'official',
        status: 'approved',
        createdAt: Date.now(),
      });
    }
  }
}
