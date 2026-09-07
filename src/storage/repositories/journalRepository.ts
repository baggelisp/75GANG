import { JournalEntry } from '@/domain/types';
import { isJournalEntry } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createDateKeyedRepository, DateKeyedRepository } from './dateKeyedRepository';

export type JournalRepository = DateKeyedRepository<JournalEntry>;

export const createJournalRepository = (store: KeyValueStore): JournalRepository =>
  createDateKeyedRepository({
    store,
    key: StorageKeyEnum.JOURNAL,
    isEntry: isJournalEntry,
  });
