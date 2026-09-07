import { DayRecord } from '@/domain/types';
import { isDayRecord } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createDateKeyedRepository, DateKeyedRepository } from './dateKeyedRepository';

export type DayRepository = DateKeyedRepository<DayRecord>;

export const createDayRepository = (store: KeyValueStore): DayRepository =>
  createDateKeyedRepository({
    store,
    key: StorageKeyEnum.DAYS,
    isEntry: isDayRecord,
  });
