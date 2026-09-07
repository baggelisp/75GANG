/**
 * The only storage interface in the app. Swapping AsyncStorage for MMKV is a new adapter behind
 * this port and nothing else, exactly as the spec anticipates.
 */
export type KeyValueStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(keys: readonly string[]): Promise<void>;
};
