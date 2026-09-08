import { createInMemoryNotificationScheduler } from '../../support/storage/inMemoryNotificationScheduler';
import { readFileSync } from 'fs';
import { join } from 'path';

import { StorageErrorEnum } from '@/domain/result';
import { Challenge, DayRecord, JournalEntry, Profile, Settings } from '@/domain/types';
import { buildRepositories, Repositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { expectFailure, expectValue } from '../../support/storage/expectResult';
import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../support/storage/inMemoryKeyValueStore';

const FIXTURES = join(__dirname, '..', '..', 'fixtures');

const readFixture = <TValue>(fileName: string): TValue =>
  JSON.parse(readFileSync(join(FIXTURES, fileName), 'utf8')) as TValue;

const A_DATE = '2026-09-06';
const ANOTHER_DATE = '2026-09-07';

const A_PROFILE: Profile = { name: 'Vangelis', createdAt: '2026-08-27T08:00:00.000Z' };

const A_JOURNAL_ENTRY: JournalEntry = {
  content: 'Hard day but I finished.',
  whatWentWell: 'Hit the water target early.',
  whatWasDifficult: 'The phone-free hour.',
  tomorrowGoal: 'Read before bed.',
  createdAt: '2026-09-06T22:05:00.000Z',
};

const SETTINGS: Settings = {
  darkMode: true,
  notificationsEnabled: true,
  morningReminder: '07:00',
  eveningReminder: '20:00',
};

const buildTestRepositories = (): { store: InMemoryKeyValueStore; repositories: Repositories } => {
  const store = createInMemoryKeyValueStore();
  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => new Date('2026-09-07T09:00:00.000Z') },
  });

  return { store, repositories };
};

describe('a repository over an empty store', () => {
  it('reads null for an absent key rather than inventing a default', async () => {
    const { repositories } = buildTestRepositories();

    const result = await repositories.challenge.read();

    expect(result).toEqual({ ok: true, value: null });
  });

  it.each(['days', 'journal'] as const)(
    'reads null for a single %s entry when nothing is stored',
    async (name) => {
      const { repositories } = buildTestRepositories();
      const repository = repositories[name];

      const result = await repository.readOne(A_DATE);

      expect(result).toEqual({ ok: true, value: null });
    },
  );
});

describe('a repository over a damaged store', () => {
  it('returns a corrupt-json error rather than throwing', async () => {
    const { store, repositories } = buildTestRepositories();
    store.seed(StorageKeyEnum.CHALLENGE, '{ this is not json');

    const result = await repositories.challenge.read();

    expect(result.ok).toBe(false);
    expect(expectFailure(result)).toBe(StorageErrorEnum.CORRUPT_JSON);
  });

  it('returns an invalid-shape error when the JSON parses but is not a challenge', async () => {
    const { store, repositories } = buildTestRepositories();
    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify({ startDate: 'not-a-date' }));

    const result = await repositories.challenge.read();

    expect(result.ok).toBe(false);
    expect(expectFailure(result)).toBe(StorageErrorEnum.INVALID_SHAPE);
  });

  it('names the key that failed, so the caller can offer to reset only that key', async () => {
    const { store, repositories } = buildTestRepositories();
    store.seed(StorageKeyEnum.PROFILE, 'nonsense');

    const result = await repositories.profile.read();

    expect(result.ok ? null : result.error.key).toBe(StorageKeyEnum.PROFILE);
  });
});

describe('round trips', () => {
  it('reads back exactly what was written for a challenge', async () => {
    const { repositories } = buildTestRepositories();
    const challenge = readFixture<Challenge>('challenge_active_day_twelve.json');

    await repositories.challenge.write(challenge);
    const result = await repositories.challenge.read();

    expect(result).toEqual({ ok: true, value: challenge });
  });

  it('reads back exactly what was written for a profile', async () => {
    const { repositories } = buildTestRepositories();

    await repositories.profile.write(A_PROFILE);

    expect(await repositories.profile.read()).toEqual({ ok: true, value: A_PROFILE });
  });

  it('reads back exactly what was written for settings', async () => {
    const { repositories } = buildTestRepositories();

    await repositories.settings.write(SETTINGS);

    expect(await repositories.settings.read()).toEqual({ ok: true, value: SETTINGS });
  });

  it('keeps a name of null, since the name is optional and null is not absent', async () => {
    const { repositories } = buildTestRepositories();
    const anonymous: Profile = { name: null, createdAt: '2026-08-27T08:00:00.000Z' };

    await repositories.profile.write(anonymous);
    const result = await repositories.profile.read();

    expect(result).toEqual({ ok: true, value: anonymous });
  });
});

describe('saving one day', () => {
  it('never overwrites the days already recorded', async () => {
    const { repositories } = buildTestRepositories();
    const perfect = readFixture<DayRecord>('perfect_day.json');
    const partial: DayRecord = { ...perfect, completedHabits: 6, perfectDay: false };

    await repositories.days.save(A_DATE, perfect);
    await repositories.days.save(ANOTHER_DATE, partial);

    const all = await repositories.days.readAll();

    const stored = expectValue(all) ?? {};

    expect(Object.keys(stored).sort()).toEqual([A_DATE, ANOTHER_DATE]);
    expect(stored[A_DATE]).toEqual(perfect);
  });

  it('replaces the record for a date that is written twice', async () => {
    const { repositories } = buildTestRepositories();
    const perfect = readFixture<DayRecord>('perfect_day.json');
    const corrected: DayRecord = { ...perfect, completedHabits: 10, perfectDay: false };

    await repositories.days.save(A_DATE, perfect);
    await repositories.days.save(A_DATE, corrected);

    expect(await repositories.days.readOne(A_DATE)).toEqual({ ok: true, value: corrected });
  });

  it('writes to the store before the save resolves, so a force-quit cannot lose it', async () => {
    const { store, repositories } = buildTestRepositories();
    const perfect = readFixture<DayRecord>('perfect_day.json');

    await repositories.days.save(A_DATE, perfect);

    expect(store.writeCount()).toBeGreaterThan(0);
    expect(store.snapshot()[StorageKeyEnum.DAYS]).toContain(A_DATE);
  });

  it('keeps journal entries separate per day', async () => {
    const { repositories } = buildTestRepositories();
    const second: JournalEntry = { ...A_JOURNAL_ENTRY, content: 'Better today.' };

    await repositories.journal.save(A_DATE, A_JOURNAL_ENTRY);
    await repositories.journal.save(ANOTHER_DATE, second);

    expect(await repositories.journal.readOne(A_DATE)).toEqual({
      ok: true,
      value: A_JOURNAL_ENTRY,
    });
    expect(await repositories.journal.readOne(ANOTHER_DATE)).toEqual({ ok: true, value: second });
  });

  it('refuses to save a day whose shape is wrong instead of writing it', async () => {
    const { store, repositories } = buildTestRepositories();
    const notADay = { habits: {} } as unknown as DayRecord;

    const result = await repositories.days.save(A_DATE, notADay);

    expect(result.ok).toBe(false);
    expect(store.snapshot()[StorageKeyEnum.DAYS]).toBeUndefined();
  });
});

describe('the five storage keys', () => {
  it('writes each record under its own key and nowhere else', async () => {
    const { store, repositories } = buildTestRepositories();

    await repositories.profile.write(A_PROFILE);
    await repositories.settings.write(SETTINGS);

    expect(Object.keys(store.snapshot()).sort()).toEqual(
      [StorageKeyEnum.PROFILE, StorageKeyEnum.SETTINGS].sort(),
    );
  });
});
