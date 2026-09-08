import { parseStoredChallenge } from '@/domain/challengeMigration';
import { Challenge } from '@/domain/types';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createJsonRecordStore, JsonRecordStore } from './jsonRecordStore';

export type ChallengeRepository = JsonRecordStore<Challenge>;

export const createChallengeRepository = (store: KeyValueStore): ChallengeRepository =>
  createJsonRecordStore({
    store,
    key: StorageKeyEnum.CHALLENGE,
    parse: parseStoredChallenge,
  });
