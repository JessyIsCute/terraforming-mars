import {BoardName} from './BoardName';
import {MapLibraryEntryId} from './MapLibraryEntry';
import {OFFICIAL_MAP_LIBRARY_BOARDS, officialMapLibraryId} from './officialMapLibrary';

/**
 * Reverse lookup: which official BoardName (if any) a Map Library entry id refers to. Kept apart
 * from the generated officialMapLibrary.ts so regenerating that file never clobbers hand-written
 * logic.
 */
export function boardNameForOfficialMapLibraryId(id: MapLibraryEntryId): BoardName | undefined {
  return OFFICIAL_MAP_LIBRARY_BOARDS.find((b) => officialMapLibraryId(b.boardName) === id)?.boardName;
}
