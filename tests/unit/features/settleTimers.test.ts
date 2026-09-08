import { createInMemoryNotificationScheduler } from '../../support/storage/inMemoryNotificationScheduler';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { DayRecordsByDate } from '@/domain/types';
import { settleRunningTimers } from '@/features/shared/settleTimers';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { endOfLocalDay, toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../support/storage/inMemoryKeyValueStore';

const MODE = ChallengeModeEnum.HARD;
const NOW = new Date('2026-09-20T09:00:00.000Z');
const AN_OLD_DAY = '2026-09-06';

const buildOver = (store: InMemoryKeyValueStore) =>
  buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => NOW },
  });

const dayWith = (habits: DayRecordsByDate[string]['habits']) => ({
  habits,
  completedHabits: 0,
  totalHabits: 11,
  completionPercentage: 0,
  perfectDay: false,
  updatedAt: '2026-09-06T22:00:00.000Z',
});

describe('settling a past day', () => {
  it('settles it against its own end, not the day the app was reopened', async () => {
    const store = createInMemoryKeyValueStore();
    const repositories = buildOver(store);
    const startedAt = new Date(endOfLocalDay(AN_OLD_DAY).getTime() - 30 * 60 * 1000).toISOString();

    const settled = await settleRunningTimers(
      repositories,
      { [AN_OLD_DAY]: dayWith({ [HabitIdEnum.SKILL]: { completed: false, value: 0, startedAt } }) },
      MODE,
      NOW,
    );

    expect(settled[AN_OLD_DAY]?.habits[HabitIdEnum.SKILL]?.value).toBeCloseTo(30, 0);
  });

  /**
   * A day that can gain nothing more must stop being rewritten, or opening the app restamps every
   * historical record with today's date for the rest of the challenge.
   */
  it('stops rewriting a day once settling would change nothing', async () => {
    const store = createInMemoryKeyValueStore();
    const repositories = buildOver(store);
    const wokeUpAt = new Date(endOfLocalDay(AN_OLD_DAY).getTime() - 90 * 60 * 1000).toISOString();

    const history: DayRecordsByDate = {
      [AN_OLD_DAY]: dayWith({
        [HabitIdEnum.MORNING_DETOX]: {
          completed: false,
          wokeUpAt,
          phoneFreeMinutes: 0,
          noContentMinutes: 0,
        },
      }),
    };

    const first = await settleRunningTimers(repositories, history, MODE, NOW);
    const writesAfterFirst = store.writeCount();

    await settleRunningTimers(repositories, first, MODE, NOW);
    await settleRunningTimers(repositories, first, MODE, NOW);

    expect(store.writeCount()).toBe(writesAfterFirst);
  });

  it('leaves a day with nothing running completely alone', async () => {
    const store = createInMemoryKeyValueStore();
    const repositories = buildOver(store);

    await settleRunningTimers(
      repositories,
      { [AN_OLD_DAY]: dayWith({ [HabitIdEnum.NO_ALCOHOL]: { completed: true } }) },
      MODE,
      NOW,
    );

    expect(store.writeCount()).toBe(0);
  });

  it('settles today against now rather than the end of today', async () => {
    const store = createInMemoryKeyValueStore();
    const repositories = buildOver(store);
    const today = toLocalIsoDate(NOW);
    const startedAt = new Date(NOW.getTime() - 20 * 60 * 1000).toISOString();

    const settled = await settleRunningTimers(
      repositories,
      { [today]: dayWith({ [HabitIdEnum.SKILL]: { completed: false, value: 0, startedAt } }) },
      MODE,
      NOW,
    );

    expect(settled[today]?.habits[HabitIdEnum.SKILL]?.value).toBeCloseTo(20, 0);
  });
});
