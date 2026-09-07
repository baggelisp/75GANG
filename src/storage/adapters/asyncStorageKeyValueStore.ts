import AsyncStorage from '@react-native-async-storage/async-storage';

import { KeyValueStore } from '@/storage/ports/keyValueStore';

/**
 * The only module in the repository that imports AsyncStorage. Replacing it with MMKV is a new
 * file next to this one and one line in `bootstrap.ts`.
 */
export const createAsyncStorageKeyValueStore = (): KeyValueStore => ({
  get: (key) => AsyncStorage.getItem(key),
  set: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
  clear: (keys) => AsyncStorage.multiRemove([...keys]),
});
