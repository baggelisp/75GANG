import { KeyValueStore } from '@/storage/ports/keyValueStore';

export type InMemoryKeyValueStore = KeyValueStore & {
  /** Everything currently held, for assertions about what was actually written. */
  snapshot(): Record<string, string>;
  /** How many writes have happened, so a test can assert a write occurred before a call resolved. */
  writeCount(): number;
  seed(key: string, value: string): void;
};

/**
 * The test double every repository test runs against. No unit test may touch AsyncStorage or the
 * file system, so this is the only store tests ever see.
 */
export const createInMemoryKeyValueStore = (): InMemoryKeyValueStore => {
  const entries = new Map<string, string>();
  const writes = { count: 0 };

  return {
    get: async (key) => entries.get(key) ?? null,
    set: async (key, value) => {
      writes.count += 1;
      entries.set(key, value);
    },
    remove: async (key) => {
      entries.delete(key);
    },
    clear: async (keys) => {
      keys.forEach((key) => entries.delete(key));
    },
    snapshot: () => Object.fromEntries(entries),
    writeCount: () => writes.count,
    seed: (key, value) => {
      entries.set(key, value);
    },
  };
};
