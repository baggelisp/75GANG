import { fail, Result, StorageErrorEnum, succeed } from '@/domain/result';
import { IsoDate } from '@/domain/types';
import { isIsoDate } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';

import { createJsonRecordStore } from './jsonRecordStore';

export type DateKeyedRepository<TEntry> = {
  readAll(): Promise<Result<Record<IsoDate, TEntry> | null>>;
  readOne(date: IsoDate): Promise<Result<TEntry | null>>;
  save(date: IsoDate, entry: TEntry): Promise<Result<TEntry>>;
  /** Reads one date, transforms it and writes it back as a single serialised step. */
  update(date: IsoDate, change: (current: TEntry | null) => TEntry): Promise<Result<TEntry>>;
  clear(): Promise<void>;
};

export type DateKeyedRepositoryConfig<TEntry> = {
  store: KeyValueStore;
  key: string;
  isEntry: (candidate: unknown) => candidate is TEntry;
};

const isObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/**
 * A map keyed by calendar date — the shape both `@75gang/days` and `@75gang/journal` use.
 *
 * Entries are validated one at a time. A single damaged record costs the user that one day, never
 * the whole challenge: the days that parse are still readable, and a new day can still be saved
 * on top. Rejecting the entire map would leave a day-60 user with no history and no way to
 * record another day.
 *
 * `save` merges through `update`, which is serialised, so two taps landing together cannot
 * clobber one another.
 */
export const createDateKeyedRepository = <TEntry>({
  store,
  key,
  isEntry,
}: DateKeyedRepositoryConfig<TEntry>): DateKeyedRepository<TEntry> => {
  const parse = (candidate: unknown): Record<IsoDate, TEntry> | null => {
    if (!isObject(candidate)) {
      return null;
    }

    const usable = Object.entries(candidate).filter(
      ([entryKey, entry]) => isIsoDate(entryKey) && isEntry(entry),
    );

    return Object.fromEntries(usable) as Record<IsoDate, TEntry>;
  };

  const records = createJsonRecordStore({ store, key, parse });

  const readOne = async (date: IsoDate): Promise<Result<TEntry | null>> => {
    const stored = await records.read();

    if (!stored.ok) {
      return stored;
    }

    if (stored.value === null) {
      return succeed(null);
    }

    return succeed(stored.value[date] ?? null);
  };

  const save = async (date: IsoDate, entry: TEntry): Promise<Result<TEntry>> => {
    if (!isIsoDate(date) || !isEntry(entry)) {
      return fail(StorageErrorEnum.INVALID_SHAPE, key);
    }

    const written = await records.update((current) => ({ ...(current ?? {}), [date]: entry }));

    if (!written.ok) {
      return written;
    }

    return succeed(entry);
  };

  /**
   * The read and the write happen inside one queued step, so two taps landing together each see
   * the other's change. Reading, transforming and saving separately would let the second tap
   * overwrite the first habit with a record built before it existed.
   */
  const update = async (
    date: IsoDate,
    change: (current: TEntry | null) => TEntry,
  ): Promise<Result<TEntry>> => {
    if (!isIsoDate(date)) {
      return fail(StorageErrorEnum.INVALID_SHAPE, key);
    }

    const changed = { entry: null as TEntry | null };

    const written = await records.update((currentMap) => {
      const entry = change(currentMap?.[date] ?? null);

      // Validated before it can reach the store: persisting a malformed entry and then reporting
      // failure would drop that day from history on the next read, silently.
      if (!isEntry(entry)) {
        return currentMap ?? {};
      }

      changed.entry = entry;

      return { ...(currentMap ?? {}), [date]: entry };
    });

    if (!written.ok) {
      return written;
    }

    if (changed.entry === null) {
      return fail(StorageErrorEnum.INVALID_SHAPE, key);
    }

    return succeed(changed.entry);
  };

  return { readAll: records.read, readOne, save, update, clear: records.clear };
};
