import { ImportPayload } from '@/domain/export/validateImport';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKey, StorageKeyEnum } from '@/storage/storageKeys';

import { enqueue } from './jsonRecordStore';

export type BackupRepository = {
  /** Replaces all five keys at once. Returns false when nothing was changed. */
  replaceAll(payload: ImportPayload): Promise<boolean>;
};

type RawEntry = readonly [StorageKey, string | null];

const ALL_KEYS: readonly StorageKey[] = Object.values(StorageKeyEnum);

/** The backup restore, as close to all-or-nothing as a key-value store allows. */
export const createBackupRepository = (store: KeyValueStore): BackupRepository => {
  const readEntry = async (key: StorageKey): Promise<RawEntry> => [key, await store.get(key)];

  const applyEntry = async ([key, value]: RawEntry): Promise<void> => {
    if (value === null) {
      await store.remove(key);

      return;
    }

    await store.set(key, value);
  };

  const applyAll = async (entries: readonly RawEntry[]): Promise<void> => {
    for (const entry of entries) {
      await applyEntry(entry);
    }
  };

  /**
   * Restores what was there before a failed write.
   *
   * Its own failure is swallowed on purpose: the import has already failed and is about to be
   * reported as such, and throwing from the recovery path would replace a clear "nothing was
   * imported" with an unhandled rejection.
   */
  const rollBack = async (entries: readonly RawEntry[]): Promise<void> => {
    try {
      await applyAll(entries);
    } catch {
      return;
    }
  };

  const replaceAll = async (payload: ImportPayload): Promise<boolean> => {
    const next = toRawEntries(payload);

    // Every key's queue is held for the whole replace, so a habit tap landing mid-import waits
    // rather than writing a day into a challenge that is being replaced underneath it.
    return withAllKeysHeld(async () => {
      let before: readonly RawEntry[] = [];

      try {
        before = await Promise.all(ALL_KEYS.map(readEntry));
      } catch {
        // Nothing has been written, so there is nothing to undo.
        return false;
      }

      try {
        await applyAll(next);
      } catch {
        await rollBack(before);

        return false;
      }

      return true;
    });
  };

  return { replaceAll };
};

/** Nests the per-key queues so the whole replace runs with every one of them held. */
const withAllKeysHeld = <TValue>(task: () => Promise<TValue>): Promise<TValue> =>
  ALL_KEYS.reduce<() => Promise<TValue>>((inner, key) => () => enqueue(key, inner), task)();

const toRawEntries = (payload: ImportPayload): readonly RawEntry[] => [
  [StorageKeyEnum.PROFILE, serialise(payload.profile)],
  [StorageKeyEnum.CHALLENGE, serialise(payload.challenge)],
  [StorageKeyEnum.DAYS, serialise(payload.days)],
  [StorageKeyEnum.JOURNAL, serialise(payload.journal)],
  [StorageKeyEnum.SETTINGS, serialise(payload.settings)],
];

const serialise = (value: unknown): string | null => {
  if (value === null) {
    return null;
  }

  return JSON.stringify(value);
};
