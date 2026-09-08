import { Settings } from '@/domain/types';
import { isSettings } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createJsonRecordStore, JsonRecordStore } from './jsonRecordStore';

export type SettingsRepository = JsonRecordStore<Settings>;

export const createSettingsRepository = (store: KeyValueStore): SettingsRepository =>
  createJsonRecordStore({
    store,
    key: StorageKeyEnum.SETTINGS,
    parse: (candidate) => (isSettings(candidate) ? candidate : null),
  });
