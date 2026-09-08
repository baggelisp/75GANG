import { readFileSync } from 'fs';
import { join } from 'path';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum, DayRecord } from '@/domain/types';
import { ReminderSyncEnum, syncReminders } from '@/features/shared/syncReminders';
import { en, translate } from '@/i18n';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../support/storage/inMemoryKeyValueStore';
import {
  createInMemoryNotificationScheduler,
  InMemoryNotificationScheduler,
} from '../../support/storage/inMemoryNotificationScheduler';

const PERFECT_DAY = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

/** Midday local, whatever the machine's timezone, so the assertions hold everywhere. */
const NOW = buildLocalMoment(2026, 9, 8, 12, 0);
const TODAY = toLocalIsoDate(NOW);

function buildLocalMoment(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

const CHALLENGE = {
  startDate: toLocalIsoDate(buildLocalMoment(2026, 8, 28, 12, 0)),
  mode: ChallengeModeEnum.HARD,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 6,
  longestStreak: 9,
  status: ChallengeStatusEnum.ACTIVE,
};

const ENABLED = { ...DEFAULT_SETTINGS, notificationsEnabled: true };

const t = (key: string, values?: Record<string, string | number>) =>
  translate(en, key, values ?? null);

type Harness = {
  store: InMemoryKeyValueStore;
  notifications: InMemoryNotificationScheduler;
  run: () => Promise<string>;
};

const buildHarness = (seed: {
  settings?: unknown;
  challenge?: unknown;
  days?: unknown;
  now?: Date;
}): Harness => {
  const store = createInMemoryKeyValueStore();
  const notifications = createInMemoryNotificationScheduler();

  if (seed.settings !== undefined) {
    store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(seed.settings));
  }

  if (seed.challenge !== undefined) {
    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(seed.challenge));
  }

  if (seed.days !== undefined) {
    store.seed(StorageKeyEnum.DAYS, JSON.stringify(seed.days));
  }

  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications,
    clock: { now: () => seed.now ?? NOW },
  });

  return { store, notifications, run: () => syncReminders(repositories, t) };
};

describe('with reminders switched on and a challenge running', () => {
  const seed = { settings: ENABLED, challenge: CHALLENGE };

  it('schedules exactly the morning and the evening reminder', async () => {
    const harness = buildHarness(seed);

    expect(await harness.run()).toBe(ReminderSyncEnum.SCHEDULED);
    expect(harness.notifications.scheduled().map((one) => one.id)).toEqual(['morning', 'evening']);
  });

  it('sets each one for the wall-clock time in settings', async () => {
    const harness = buildHarness(seed);
    await harness.run();

    const [morning, evening] = harness.notifications.scheduled();
    // 07:00 has already gone by at midday, so it lands tomorrow.
    expect(morning?.at).toEqual(buildLocalMoment(2026, 9, 9, 7, 0));
    expect(evening?.at).toEqual(buildLocalMoment(2026, 9, 8, 20, 0));
  });

  it('names the day the morning reminder is actually about', async () => {
    const harness = buildHarness(seed);
    await harness.run();

    expect(harness.notifications.scheduled()[0]?.title).toBe('Day 13');
  });

  it('carries the live completed count on the evening reminder', async () => {
    const harness = buildHarness({ ...seed, days: { [TODAY]: PERFECT_DAY } });
    await harness.run();

    expect(harness.notifications.scheduled()[1]?.title).toBe('11 of 11 done');
    expect(harness.notifications.scheduled()[1]?.body).toBe(
      'Every rule met. Log the day and sleep well.',
    );
  });

  it('still names the total when nothing has been recorded today', async () => {
    const harness = buildHarness(seed);
    await harness.run();

    expect(harness.notifications.scheduled()[1]?.title).toBe('0 of 11 done');
  });

  it('replaces rather than stacks, so a second sync leaves two reminders and not four', async () => {
    const harness = buildHarness(seed);

    await harness.run();
    await harness.run();

    expect(harness.notifications.scheduled()).toHaveLength(2);
    expect(harness.notifications.cancelCount()).toBe(2);
  });
});

describe('when there is nothing to remind anyone about', () => {
  it.each([
    ['reminders are switched off', { settings: DEFAULT_SETTINGS, challenge: CHALLENGE }],
    ['there is no challenge', { settings: ENABLED }],
    [
      'the challenge is already finished',
      {
        settings: ENABLED,
        challenge: { ...CHALLENGE, status: ChallengeStatusEnum.COMPLETED },
      },
    ],
    [
      'the last day of the challenge has gone by',
      {
        settings: ENABLED,
        challenge: {
          ...CHALLENGE,
          startDate: toLocalIsoDate(buildLocalMoment(2026, 1, 1, 12, 0)),
        },
      },
    ],
  ])('cancels everything when %s', async (_reason, seed) => {
    const harness = buildHarness(seed);

    expect(await harness.run()).toBe(ReminderSyncEnum.CLEARED);
    expect(harness.notifications.scheduled()).toEqual([]);
    expect(harness.notifications.cancelCount()).toBe(1);
  });

  it('cancels what was already scheduled when reminders are switched off', async () => {
    const harness = buildHarness({ settings: ENABLED, challenge: CHALLENGE });
    await harness.run();
    expect(harness.notifications.scheduled()).toHaveLength(2);

    harness.store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

    expect(await harness.run()).toBe(ReminderSyncEnum.CLEARED);
    expect(harness.notifications.scheduled()).toEqual([]);
  });

  it('cancels everything once the challenge has been reset away', async () => {
    const harness = buildHarness({ settings: ENABLED, challenge: CHALLENGE });
    await harness.run();

    harness.store.remove(StorageKeyEnum.CHALLENGE);

    expect(await harness.run()).toBe(ReminderSyncEnum.CLEARED);
    expect(harness.notifications.scheduled()).toEqual([]);
  });
});

describe('when the phone will not allow notifications', () => {
  it('says so and schedules nothing, rather than failing silently', async () => {
    const harness = buildHarness({ settings: ENABLED, challenge: CHALLENGE });
    harness.notifications.denyPermission();

    expect(await harness.run()).toBe(ReminderSyncEnum.PERMISSION_DENIED);
    expect(harness.notifications.scheduled()).toEqual([]);
  });
});

describe('when the settings could not be read', () => {
  it('leaves whatever is scheduled alone rather than cancelling on a guess', async () => {
    const store = createInMemoryKeyValueStore();
    const notifications = createInMemoryNotificationScheduler();

    store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(ENABLED));
    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));

    const repositories = buildRepositories({
      store,
      files: createInMemoryFileStore(),
      transport: createInMemoryBackupTransport(),
      notifications,
      clock: { now: () => NOW },
    });

    await syncReminders(repositories, t);
    expect(notifications.scheduled()).toHaveLength(2);

    const failing = buildRepositories({
      store: {
        ...store,
        get: async () => {
          throw new Error('Storage unavailable');
        },
      },
      files: createInMemoryFileStore(),
      transport: createInMemoryBackupTransport(),
      notifications,
      clock: { now: () => NOW },
    });

    expect(await syncReminders(failing, t)).toBe(ReminderSyncEnum.CLEARED);
    expect(notifications.scheduled()).toHaveLength(2);
    expect(notifications.cancelCount()).toBe(1);
  });
});

describe('on the days the clocks change', () => {
  /**
   * Deriving the minute of the day by subtracting midnight is an hour out on both DST days, so
   * these pin the hour on each side of the skew. Europe/Athens springs forward at 03:00 on
   * 29 March 2026 and falls back at 04:00 on 25 October; in a timezone with no transition the
   * assertions still hold, they simply stop being interesting.
   */
  const buildAt = (at: Date, morning: string, evening: string) =>
    buildHarness({
      settings: { ...ENABLED, morningReminder: morning, eveningReminder: evening },
      challenge: { ...CHALLENGE, startDate: toLocalIsoDate(at) },
      now: at,
    });

  it('sends a reminder already gone by to tomorrow, even on the short day', async () => {
    // 10:00 wall clock is only nine elapsed hours after midnight once an hour is skipped.
    const at = new Date(2026, 2, 29, 10, 0, 0, 0);
    const harness = buildAt(at, '09:30', '20:00');

    await harness.run();

    const morning = harness.notifications.scheduled().find((one) => one.id === 'morning');
    expect(morning?.at).toEqual(new Date(2026, 2, 30, 9, 30, 0, 0));
  });

  it('keeps a reminder still to come on today, even on the long day', async () => {
    // 10:00 wall clock is eleven elapsed hours after midnight once an hour is repeated.
    const at = new Date(2026, 9, 25, 10, 0, 0, 0);
    const harness = buildAt(at, '07:00', '10:30');

    await harness.run();

    const evening = harness.notifications.scheduled().find((one) => one.id === 'evening');
    expect(evening?.at).toEqual(new Date(2026, 9, 25, 10, 30, 0, 0));
  });
});

describe('two syncs landing together', () => {
  it('leaves the queue as the last one asked for, not as the first one did', async () => {
    const store = createInMemoryKeyValueStore();
    const notifications = createInMemoryNotificationScheduler();

    store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(ENABLED));
    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));

    const repositories = buildRepositories({
      store,
      files: createInMemoryFileStore(),
      transport: createInMemoryBackupTransport(),
      notifications,
      clock: { now: () => NOW },
    });

    // The first sync reads reminders as on. Before it finishes, they are switched off.
    const first = syncReminders(repositories, t);
    store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    const second = syncReminders(repositories, t);

    await Promise.all([first, second]);

    // Interleaved, the first sync's schedule would land after the second one's cancel.
    expect(notifications.scheduled()).toEqual([]);
  });
});
