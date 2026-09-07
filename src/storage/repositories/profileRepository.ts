import { Profile } from '@/domain/types';
import { isProfile } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createJsonRecordStore, JsonRecordStore } from './jsonRecordStore';

export type ProfileRepository = JsonRecordStore<Profile>;

export const createProfileRepository = (store: KeyValueStore): ProfileRepository =>
  createJsonRecordStore({
    store,
    key: StorageKeyEnum.PROFILE,
    parse: (candidate) => (isProfile(candidate) ? candidate : null),
  });
