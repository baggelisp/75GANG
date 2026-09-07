import { createAsyncStorageKeyValueStore } from './adapters/asyncStorageKeyValueStore';
import { createExpoFileStore } from './adapters/expoFileStore';
import { createSystemClock } from './adapters/systemClock';
import { buildRepositories, Repositories } from './repositories/buildRepositories';

export type { Repositories } from './repositories/buildRepositories';

/**
 * The composition root: the only module in the repository that constructs a concrete adapter.
 * Swapping AsyncStorage for MMKV changes exactly one line here.
 */
export const createRepositories = (): Repositories =>
  buildRepositories({
    store: createAsyncStorageKeyValueStore(),
    files: createExpoFileStore(),
    clock: createSystemClock(),
  });
