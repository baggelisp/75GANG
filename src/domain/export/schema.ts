import {
  Challenge,
  DayRecordsByDate,
  IsoDate,
  IsoTimestamp,
  JournalEntriesByDate,
  Profile,
  Settings,
} from '../types';

/** What an import checks before it will read a file. */
export const APP_ID = '75gang';

/**
 * The version of the export format this build writes and can read.
 *
 * Raised only when a change would make an older app misread a newer file. Adding a field does not
 * qualify: unknown fields are ignored on import, which is what keeps every past export readable.
 */
export const SCHEMA_VERSION = 1;

export type ExportEnvelope = {
  app: typeof APP_ID;
  schemaVersion: number;
  exportedAt: IsoTimestamp;
  profile: Profile | null;
  challenge: Challenge | null;
  days: DayRecordsByDate;
  journal: JournalEntriesByDate;
  settings: Settings | null;
};

export type ExportSource = {
  profile: Profile | null;
  challenge: Challenge | null;
  days: DayRecordsByDate | null;
  journal: JournalEntriesByDate | null;
  settings: Settings | null;
  exportedAt: IsoTimestamp;
};

/**
 * The five storage keys wrapped in the header from the spec.
 *
 * Progress photos are deliberately absent: the JSON keeps the weight and the photo path, and the
 * image files stay on the device. Seventy-five photos would make the file far too large to share.
 *
 * A key that was never written exports as `null` rather than being left out, so a reader can tell
 * "nothing was ever saved here" from "this build did not know about that key". The two maps are
 * the exception — an empty map says the same thing and keeps them one type on both sides.
 */
export const buildExportEnvelope = ({
  profile,
  challenge,
  days,
  journal,
  settings,
  exportedAt,
}: ExportSource): ExportEnvelope => ({
  app: APP_ID,
  schemaVersion: SCHEMA_VERSION,
  exportedAt,
  profile,
  challenge,
  days: days ?? {},
  journal: journal ?? {},
  settings,
});

export const buildBackupFileName = (date: IsoDate): string => `75gang-backup-${date}.json`;
