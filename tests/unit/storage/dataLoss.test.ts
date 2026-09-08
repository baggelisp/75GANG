import { createInMemoryNotificationScheduler } from '../../support/storage/inMemoryNotificationScheduler';
import { readFileSync } from 'fs';
import { join } from 'path';

import { StorageErrorEnum } from '@/domain/result';
import { DayRecord } from '@/domain/types';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories, Repositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { expectFailure, expectValue } from '../../support/storage/expectResult';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../support/storage/inMemoryKeyValueStore';

const PERFECT_DAY: DayRecord = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

const FIRST_DATE = '2026-09-05';
const SECOND_DATE = '2026-09-06';
const THIRD_DATE = '2026-09-07';

const buildOver = (store: KeyValueStore): Repositories =>
  buildRepositories({
    store,
    files: {
      write: async () => 'photos/x.jpg',
      writeText: async () => 'backup.json',
      readTextAt: async () => '{}',
      exists: async () => true,
      remove: async () => undefined,
      removeDirectory: async () => undefined,
      resolveUri: (path) => `file:///documents/${path}`,
    },
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => new Date('2026-09-07T09:00:00.000Z') },
  });

const buildInMemory = (): { store: InMemoryKeyValueStore; repositories: Repositories } => {
  const store = createInMemoryKeyValueStore();

  return { store, repositories: buildOver(store) };
};

const dayWith = (completedHabits: number): DayRecord => ({
  ...PERFECT_DAY,
  completedHabits,
  perfectDay: completedHabits === PERFECT_DAY.totalHabits,
});

describe('two saves landing together', () => {
  it('keeps both days instead of letting the second write erase the first', async () => {
    const { repositories } = buildInMemory();

    await Promise.all([
      repositories.days.save(FIRST_DATE, dayWith(11)),
      repositories.days.save(SECOND_DATE, dayWith(9)),
    ]);

    const stored = expectValue(await repositories.days.readAll());

    expect(Object.keys(stored ?? {}).sort()).toEqual([FIRST_DATE, SECOND_DATE]);
  });

  it('keeps the last of several rapid taps on the same day, and loses none of the others', async () => {
    const { repositories } = buildInMemory();

    await Promise.all([
      repositories.days.save(THIRD_DATE, dayWith(4)),
      repositories.days.save(FIRST_DATE, dayWith(11)),
      repositories.days.save(SECOND_DATE, dayWith(7)),
    ]);

    const stored = expectValue(await repositories.days.readAll());

    expect(Object.keys(stored ?? {}).sort()).toEqual([FIRST_DATE, SECOND_DATE, THIRD_DATE]);
  });
});

describe('one damaged day record', () => {
  const seedWithOneBadDay = () => {
    const { store, repositories } = buildInMemory();

    store.seed(
      StorageKeyEnum.DAYS,
      JSON.stringify({
        [FIRST_DATE]: PERFECT_DAY,
        [SECOND_DATE]: { completedHabits: 'oops' },
      }),
    );

    return { store, repositories };
  };

  it('still reads the days that are intact', async () => {
    const { repositories } = seedWithOneBadDay();

    expect(expectValue(await repositories.days.readOne(FIRST_DATE))).toEqual(PERFECT_DAY);
  });

  it('drops only the damaged day rather than the whole challenge', async () => {
    const { repositories } = seedWithOneBadDay();

    const stored = expectValue(await repositories.days.readAll());

    expect(Object.keys(stored ?? {})).toEqual([FIRST_DATE]);
  });

  it('still accepts a new day, so the challenge can continue', async () => {
    const { repositories } = seedWithOneBadDay();

    const saved = await repositories.days.save(THIRD_DATE, dayWith(8));

    expect(saved.ok).toBe(true);
    expect(expectValue(await repositories.days.readOne(THIRD_DATE))).toEqual(dayWith(8));
  });

  it('ignores an unknown non-date key written by a future version', async () => {
    const { store, repositories } = buildInMemory();
    store.seed(
      StorageKeyEnum.DAYS,
      JSON.stringify({ [FIRST_DATE]: PERFECT_DAY, schemaVersion: 2 }),
    );

    expect(Object.keys(expectValue(await repositories.days.readAll()) ?? {})).toEqual([FIRST_DATE]);
  });
});

describe('a device store that fails', () => {
  const throwingStore = (): KeyValueStore => ({
    get: async () => {
      throw new Error('SQLite read failed');
    },
    set: async () => {
      throw new Error('Disk full');
    },
    remove: async () => undefined,
    clear: async () => undefined,
  });

  it('returns a read error rather than throwing out of the Result type', async () => {
    const repositories = buildOver(throwingStore());

    expect(expectFailure(await repositories.challenge.read())).toBe(StorageErrorEnum.READ_FAILED);
  });

  it('returns a write error rather than throwing, so a full disk cannot crash a habit tap', async () => {
    const repositories = buildOver({ ...throwingStore(), get: async () => null });

    expect(expectFailure(await repositories.days.save(THIRD_DATE, dayWith(6)))).toBe(
      StorageErrorEnum.WRITE_FAILED,
    );
  });
});

describe('a calendar-impossible date', () => {
  it.each(['2026-02-30', '2026-13-01', '0000-00-00'])('refuses to save under %s', async (date) => {
    const { repositories } = buildInMemory();

    expect(expectFailure(await repositories.days.save(date, dayWith(5)))).toBe(
      StorageErrorEnum.INVALID_SHAPE,
    );
  });

  it('accepts a real leap day', async () => {
    const { repositories } = buildInMemory();

    expect((await repositories.days.save('2028-02-29', dayWith(5))).ok).toBe(true);
  });
});
