import { fail, Result, StorageErrorEnum, succeed } from '@/domain/result';
import { KeyValueStore } from '@/storage/ports/keyValueStore';

export type JsonRecordStore<TValue> = {
  read(): Promise<Result<TValue | null>>;
  write(value: TValue): Promise<Result<TValue>>;
  /** Read, transform and write as one uninterruptible step. */
  update(change: (current: TValue | null) => TValue): Promise<Result<TValue>>;
  clear(): Promise<void>;
};

export type JsonRecordStoreConfig<TValue> = {
  store: KeyValueStore;
  key: string;
  /** Returns the usable value, or null when the stored blob is not this record at all. */
  parse: (candidate: unknown) => TValue | null;
};

/**
 * Serialises every read-modify-write against a storage key.
 *
 * Two overlapping saves would otherwise both read the pre-merge map and the second would clobber
 * the first — losing a whole day of a 75-day challenge. The chain is keyed by storage key rather
 * than held per instance, so two repositories over the same key still take turns.
 */
const writeQueues = new Map<string, Promise<unknown>>();

/**
 * Runs a task with the queue for a storage key held.
 *
 * Exported so a restore can take the same turn a habit tap takes: an import replaces every key,
 * and a tap landing halfway through would otherwise write a day into a challenge that no longer
 * exists.
 */

export const enqueue = <TValue>(key: string, task: () => Promise<TValue>): Promise<TValue> => {
  const previous = writeQueues.get(key) ?? Promise.resolve();
  const next = previous.then(task, task);

  writeQueues.set(
    key,
    next.catch(() => undefined),
  );

  return next;
};

/**
 * Shared read/write behaviour for the five storage keys.
 *
 * An absent key reads as `null` rather than a fabricated default, so a caller can tell "no
 * challenge yet" from "a challenge with zero days". Corrupt JSON and a failing device store both
 * return a typed error instead of throwing, because neither may crash a challenge on day 60.
 */
export const createJsonRecordStore = <TValue>({
  store,
  key,
  parse,
}: JsonRecordStoreConfig<TValue>): JsonRecordStore<TValue> => {
  const readNow = async (): Promise<Result<TValue | null>> => {
    const raw = await readRaw();

    if (!raw.ok) {
      return raw;
    }

    if (raw.value === null) {
      return succeed(null);
    }

    const parsed = parseJson(raw.value);

    if (!parsed.ok) {
      return fail(StorageErrorEnum.CORRUPT_JSON, key);
    }

    const value = parse(parsed.value);

    if (value === null) {
      return fail(StorageErrorEnum.INVALID_SHAPE, key);
    }

    return succeed(value);
  };

  const readRaw = async (): Promise<Result<string | null>> => {
    try {
      return succeed(await store.get(key));
    } catch {
      return fail(StorageErrorEnum.READ_FAILED, key);
    }
  };

  const writeNow = async (value: TValue): Promise<Result<TValue>> => {
    if (parse(value) === null) {
      return fail(StorageErrorEnum.INVALID_SHAPE, key);
    }

    try {
      await store.set(key, JSON.stringify(value));
    } catch {
      return fail(StorageErrorEnum.WRITE_FAILED, key);
    }

    return succeed(value);
  };

  const update = (change: (current: TValue | null) => TValue): Promise<Result<TValue>> =>
    enqueue(key, async () => {
      const current = await readNow();

      if (!current.ok) {
        return current;
      }

      return writeNow(change(current.value));
    });

  const clear = async (): Promise<void> => {
    await enqueue(key, () => store.remove(key));
  };

  return {
    read: readNow,
    write: (value) => enqueue(key, () => writeNow(value)),
    update,
    clear,
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
