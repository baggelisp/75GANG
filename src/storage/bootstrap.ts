import { createAsyncStorageKeyValueStore } from './adapters/asyncStorageKeyValueStore';
import { createExpoFileStore } from './adapters/expoFileStore';
import { createSystemClock } from './adapters/systemClock';
import { buildRepositories, Repositories } from './repositories/buildRepositories';

export type { Repositories } from './repositories/buildRepositories';

/**
 * Re-exported so the route layer has exactly one door into `src/storage`, as the import table
 * requires — a route imports the composition root and nothing else under storage.
 */
export { RepositoryProvider, useRepositories } from './repositoryContext';

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
