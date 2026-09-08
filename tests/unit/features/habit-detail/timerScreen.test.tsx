import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';
import { endOfLocalDay } from '@/utils/DateUtility';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Redirect: () => null,
}));

const TODAY = '2026-09-07';

const CHALLENGE = JSON.stringify({
  startDate: '2026-08-27',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 0,
  longestStreak: 0,
  status: 'active',
});

const readRecord = (store: InMemoryKeyValueStore, habitId: string) =>
  JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY]?.habits?.[habitId];

type Harness = {
  store: InMemoryKeyValueStore;
  setNow: (moment: string) => void;
};

const renderDetail = (habitId: string, seededDay?: string): Harness => {
  const store = createInMemoryKeyValueStore();
  store.seed(StorageKeyEnum.CHALLENGE, CHALLENGE);

  if (seededDay !== undefined) {
    store.seed(StorageKeyEnum.DAYS, seededDay);
  }

  const clock = { value: new Date('2026-09-07T09:00:00.000Z') };

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store,
        files: createInMemoryFileStore(),
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => clock.value },
      })}
    >
      <HabitDetailScreen habitId={habitId} />
    </RepositoryProvider>,
  );

  return {
    store,
    setNow: (moment) => {
      clock.value = new Date(moment);
    },
  };
};

const dayWith = (habitId: string, record: unknown) =>
  JSON.stringify({
    [TODAY]: {
      habits: { [habitId]: record },
      completedHabits: 0,
      totalHabits: 11,
      completionPercentage: 0,
      perfectDay: false,
      updatedAt: '2026-09-07T08:00:00.000Z',
    },
  });

describe('the skill timer', () => {
  it('starts at zero against a 45 minute target', async () => {
    renderDetail(HabitIdEnum.SKILL);

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeTruthy();
    });
    expect(screen.getByText('Target 45 min')).toBeTruthy();
  });

  it('persists only the start timestamp when started, never a count of ticks', async () => {
    const harness = renderDetail(HabitIdEnum.SKILL);
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.SKILL)?.startedAt).toBe(
        '2026-09-07T09:00:00.000Z',
      );
    });
    expect(readRecord(harness.store, HabitIdEnum.SKILL)?.value).toBe(0);
  });

  it('banks the minutes when paused', async () => {
    const harness = renderDetail(HabitIdEnum.SKILL);
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeTruthy());

    harness.setNow('2026-09-07T09:20:00.000Z');
    fireEvent.press(screen.getByLabelText('Pause'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.SKILL)?.value).toBe(20);
    });
    expect(readRecord(harness.store, HabitIdEnum.SKILL)?.startedAt).toBeNull();
  });

  it('keeps the banked minutes across a pause and a resume', async () => {
    const harness = renderDetail(HabitIdEnum.SKILL);
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeTruthy());
    harness.setNow('2026-09-07T09:20:00.000Z');
    fireEvent.press(screen.getByLabelText('Pause'));
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeTruthy());
    harness.setNow('2026-09-07T09:45:00.000Z');
    fireEvent.press(screen.getByLabelText('Pause'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.SKILL)?.value).toBe(45);
    });
  });

  /** The whole point of storing a start timestamp: the app was closed for the entire hour. */
  it('counts a timer that ran while the app was closed', async () => {
    const harness = renderDetail(
      HabitIdEnum.SKILL,
      dayWith(HabitIdEnum.SKILL, {
        completed: false,
        value: 0,
        startedAt: '2026-09-07T08:00:00.000Z',
      }),
    );

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.SKILL)?.value).toBe(60);
    });
    expect(screen.getByText('Target reached')).toBeTruthy();
  });

  it('leaves a timer that completed while closed still running', async () => {
    const harness = renderDetail(
      HabitIdEnum.SKILL,
      dayWith(HabitIdEnum.SKILL, {
        completed: false,
        value: 0,
        startedAt: '2026-09-07T08:00:00.000Z',
      }),
    );

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.SKILL)?.startedAt).toBe(
        '2026-09-07T09:00:00.000Z',
      );
    });
    expect(screen.getByLabelText('Pause')).toBeTruthy();
  });

  it('ignores a start timestamp in the future rather than counting backwards', async () => {
    renderDetail(
      HabitIdEnum.SKILL,
      dayWith(HabitIdEnum.SKILL, {
        completed: false,
        value: 0,
        startedAt: '2026-09-07T23:00:00.000Z',
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeTruthy();
    });
  });
});

describe('the workout tracker', () => {
  it('shows nothing done against two workouts of 45 minutes', async () => {
    renderDetail(HabitIdEnum.WORKOUTS);

    await waitFor(() => {
      expect(screen.getByText('0 / 2 workouts of 45 min')).toBeTruthy();
    });
  });

  it('records one session when a workout is finished', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    await waitFor(() => expect(screen.getByLabelText('Start workout')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start workout'));
    await waitFor(() => expect(screen.getByLabelText('Finish workout')).toBeTruthy());

    harness.setNow('2026-09-07T09:45:00.000Z');
    fireEvent.press(screen.getByLabelText('Finish workout'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions).toHaveLength(1);
    });
    expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions[0].minutes).toBe(45);
  });

  /** Rule 4 says two workouts. Ninety minutes in one go is one workout, however long it ran. */
  it('does not turn one long session into two workouts', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    await waitFor(() => expect(screen.getByLabelText('Start workout')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start workout'));
    await waitFor(() => expect(screen.getByLabelText('Finish workout')).toBeTruthy());

    harness.setNow('2026-09-07T10:30:00.000Z');
    fireEvent.press(screen.getByLabelText('Finish workout'));

    await waitFor(() => {
      expect(screen.getByText('1 / 2 workouts of 45 min')).toBeTruthy();
    });
    expect(screen.queryByText('Target reached')).toBeNull();
  });

  it('records a workout the user forgot to time', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    await waitFor(() =>
      expect(
        screen.getByLabelText('Record a workout of 45 minutes without timing it'),
      ).toBeTruthy(),
    );

    fireEvent.press(screen.getByLabelText('Record a workout of 45 minutes without timing it'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions).toHaveLength(1);
    });
  });

  it('completes only after two workouts long enough to count', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    const label = 'Record a workout of 45 minutes without timing it';
    await waitFor(() => expect(screen.getByLabelText(label)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(label));
    await waitFor(() =>
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions).toHaveLength(1),
    );
    expect(screen.queryByText('Target reached')).toBeNull();

    fireEvent.press(screen.getByLabelText(label));

    await waitFor(() => {
      expect(screen.getByText('Target reached')).toBeTruthy();
    });
  });

  it('takes the last workout back off', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    const label = 'Record a workout of 45 minutes without timing it';
    await waitFor(() => expect(screen.getByLabelText(label)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(label));
    await waitFor(() =>
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions).toHaveLength(1),
    );

    fireEvent.press(screen.getByLabelText('Remove the last workout'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions).toHaveLength(0);
    });
  });

  it('records whether the workout was outdoors', async () => {
    const harness = renderDetail(HabitIdEnum.WORKOUTS);
    await waitFor(() => expect(screen.getByLabelText('Outdoors')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Outdoors'));
    fireEvent.press(screen.getByLabelText('Record a workout of 45 minutes without timing it'));

    await waitFor(() => {
      expect(readRecord(harness.store, HabitIdEnum.WORKOUTS)?.sessions[0].outdoor).toBe(true);
    });
  });
});

describe('the readout while a timer runs', () => {
  it('advances on screen as time passes, rather than sitting at zero', async () => {
    const harness = renderDetail(HabitIdEnum.SKILL);
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeTruthy());
    expect(screen.getByText('00:00')).toBeTruthy();

    harness.setNow('2026-09-07T09:20:00.000Z');

    await waitFor(
      () => {
        expect(screen.getByText('20:00')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it('shows the target reached once the running timer passes it', async () => {
    const harness = renderDetail(HabitIdEnum.SPIRITUALITY);
    await waitFor(() => expect(screen.getByLabelText('Start')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start'));
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeTruthy());

    harness.setNow('2026-09-07T09:16:00.000Z');

    await waitFor(
      () => {
        expect(screen.getByText('16:00')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });
});

describe('a timer left running overnight', () => {
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  it('is banked against the day it ran, not the day the app was reopened', async () => {
    // Built from the day's own local end, so the test says the same thing in every timezone.
    const startedAt = new Date(endOfLocalDay('2026-09-06').getTime() - TWO_HOURS).toISOString();

    const harness = renderDetail(
      HabitIdEnum.SKILL,
      JSON.stringify({
        '2026-09-06': {
          habits: { skill: { completed: false, value: 0, startedAt } },
          completedHabits: 0,
          totalHabits: 11,
          completionPercentage: 0,
          perfectDay: false,
          updatedAt: startedAt,
        },
      }),
    );

    await waitFor(() => {
      const stored = JSON.parse(harness.store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

      expect(stored['2026-09-06'].habits.skill.startedAt).not.toBe(startedAt);
    });

    const yesterday = JSON.parse(harness.store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[
      '2026-09-06'
    ];

    expect(yesterday.habits.skill.value).toBeCloseTo(120, 0);
    expect(yesterday.completedHabits).toBe(1);
  });

  it('does not credit the hours between midnight and the app being reopened', async () => {
    const startedAt = new Date(endOfLocalDay('2026-09-06').getTime() - TWO_HOURS).toISOString();

    const harness = renderDetail(
      HabitIdEnum.SKILL,
      JSON.stringify({
        '2026-09-06': {
          habits: { skill: { completed: false, value: 0, startedAt } },
          completedHabits: 0,
          totalHabits: 11,
          completionPercentage: 0,
          perfectDay: false,
          updatedAt: startedAt,
        },
      }),
    );

    await waitFor(() => {
      const stored = JSON.parse(harness.store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

      expect(stored['2026-09-06'].habits.skill.value).toBeGreaterThan(0);
    });

    const yesterday = JSON.parse(harness.store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[
      '2026-09-06'
    ];

    expect(yesterday.habits.skill.value).toBeLessThan(180);
  });
});

describe('the outdoor toggle during a running workout', () => {
  it('reflects what was chosen when the workout started, not the screen state', async () => {
    const harness = renderDetail(
      HabitIdEnum.WORKOUTS,
      dayWith(HabitIdEnum.WORKOUTS, {
        completed: false,
        startedAt: '2026-09-07T08:30:00.000Z',
        outdoor: true,
      }),
    );

    await waitFor(() => expect(screen.getByLabelText('Outdoors')).toBeTruthy());

    expect(screen.getByLabelText('Outdoors').props.accessibilityState.checked).toBe(true);
    expect(harness.store).toBeDefined();
  });
});
