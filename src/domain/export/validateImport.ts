import { parseStoredChallenge } from '../challengeMigration';
import { Challenge, DayRecordsByDate, JournalEntriesByDate, Profile, Settings } from '../types';
import { isDayRecord, isJournalEntry, isIsoDate, isProfile, isSettings } from '../validation';
import { APP_ID, SCHEMA_VERSION } from './schema';

export const ImportRejectionEnum = {
  NOT_JSON: 'NOT_JSON',
  NOT_A_BACKUP: 'NOT_A_BACKUP',
  SCHEMA_TOO_NEW: 'SCHEMA_TOO_NEW',
  CHALLENGE_INVALID: 'CHALLENGE_INVALID',
} as const;

export type ImportRejection = (typeof ImportRejectionEnum)[keyof typeof ImportRejectionEnum];

/** Exactly the five storage keys, ready to be written. Nothing is written until this exists. */
export type ImportPayload = {
  profile: Profile | null;
  challenge: Challenge;
  days: DayRecordsByDate;
  journal: JournalEntriesByDate;
  settings: Settings | null;
};

export type ImportValidation =
  { ok: true; value: ImportPayload } | { ok: false; reason: ImportRejection };

const isObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

const reject = (reason: ImportRejection): ImportValidation => ({ ok: false, reason });

/**
 * Decides whether a file may replace everything on the device — before a single byte is written.
 *
 * The four rejections are the ones from the spec, each with its own reason so the screen can say
 * what is actually wrong rather than "invalid file". Anything past those four is treated as
 * damage rather than grounds for refusal: an unreadable day is dropped and the other seventy-four
 * still restore, because refusing the whole backup over one bad record would cost the user
 * everything to save them from losing one day.
 *
 * The challenge is the exception. It is the record the app's whole state hangs off, and importing
 * without one would leave the user with days, a journal and no challenge to hang them on.
 */
export const validateImport = (raw: string): ImportValidation => {
  const parsed = parseJson(raw);

  if (!parsed.ok) {
    return reject(ImportRejectionEnum.NOT_JSON);
  }

  const file = parsed.value;

  if (!isObject(file) || file.app !== APP_ID) {
    return reject(ImportRejectionEnum.NOT_A_BACKUP);
  }

  if (typeof file.schemaVersion !== 'number' || !Number.isFinite(file.schemaVersion)) {
    return reject(ImportRejectionEnum.NOT_A_BACKUP);
  }

  if (file.schemaVersion > SCHEMA_VERSION) {
    return reject(ImportRejectionEnum.SCHEMA_TOO_NEW);
  }

  const challenge = parseStoredChallenge(file.challenge);

  if (challenge === null) {
    return reject(ImportRejectionEnum.CHALLENGE_INVALID);
  }

  return {
    ok: true,
    value: {
      profile: isProfile(file.profile) ? file.profile : null,
      challenge,
      days: collectByDate(file.days, isDayRecord),
      journal: collectByDate(file.journal, isJournalEntry),
      settings: isSettings(file.settings) ? file.settings : null,
    },
  };
};

type ParsedJson = { ok: true; value: unknown } | { ok: false };

const parseJson = (raw: string): ParsedJson => {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
};

const collectByDate = <TEntry>(
  candidate: unknown,
  isEntry: (entry: unknown) => entry is TEntry,
): Record<string, TEntry> => {
  if (!isObject(candidate)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(candidate).filter(([date, entry]) => isIsoDate(date) && isEntry(entry)),
  ) as Record<string, TEntry>;
};
