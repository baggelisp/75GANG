import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum } from '@/domain/types';
import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';
import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    Redirect: () => null,
  };
});

const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);

const MARK = 'Mark this rule as done';
const UNDO = 'Take the mark off and go back to what the counter says';

const renderHabit = (habitId: string, habits: Record<string, unknown>) => {
  const store = createInMemoryKeyValueStore();

  store.seed(
    StorageKeyEnum.CHALLENGE,
    JSON.stringify({
      startDate: TODAY,
      mode: ChallengeModeEnum.HARD,
      totalDays: CHALLENGE_LENGTH_DAYS,
      currentStreak: 0,
      longestStreak: 0,
      status: ChallengeStatusEnum.ACTIVE,
    }),
  );
  store.seed(
    StorageKeyEnum.DAYS,
    JSON.stringify({
      [TODAY]: {
        habits,
        completedHabits: 0,
        totalHabits: 11,
        completionPercentage: 0,
        perfectDay: false,
        updatedAt: NOW.toISOString(),
      },
    }),
  );

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store,
        files: createInMemoryFileStore(),
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => NOW },
      })}
    >
      <HabitDetailScreen habitId={habitId} />
    </RepositoryProvider>,
  );

  return store;
};

const readHabit = (store: InMemoryKeyValueStore, habitId: string): Record<string, unknown> => {
  const days = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

  return days[TODAY]?.habits?.[habitId] ?? {};
};

const A_HALF_FINISHED_MORNING = {
  [HabitIdEnum.MORNING_DETOX]: {
    completed: false,
    wokeUpAt: NOW.toISOString(),
    phoneFreeMinutes: 60,
    noContentMinutes: 95,
  },
};

describe('a rule the counter has not finished', () => {
  it('offers to mark it done by hand', async () => {
    renderHabit(HabitIdEnum.MORNING_DETOX, A_HALF_FINISHED_MORNING);

    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());
  });

  it('records the mark, keeping the minutes that were already banked', async () => {
    const store = renderHabit(HabitIdEnum.MORNING_DETOX, A_HALF_FINISHED_MORNING);
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => {
      expect(readHabit(store, HabitIdEnum.MORNING_DETOX).markedDone).toBe(true);
    });
    expect(readHabit(store, HabitIdEnum.MORNING_DETOX).noContentMinutes).toBe(95);
  });

  it('says the mark was the user’s own doing, not the counter’s', async () => {
    renderHabit(HabitIdEnum.MORNING_DETOX, A_HALF_FINISHED_MORNING);
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => {
      expect(screen.getByText('You marked this done yourself.')).toBeTruthy();
    });
  });

  it('counts towards the day once marked', async () => {
    const store = renderHabit(HabitIdEnum.MORNING_DETOX, A_HALF_FINISHED_MORNING);
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => {
      const days = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

      expect(days[TODAY].completedHabits).toBe(1);
    });
  });
});

describe('taking the mark off', () => {
  it('returns the rule to whatever the counter says', async () => {
    const store = renderHabit(HabitIdEnum.MORNING_DETOX, A_HALF_FINISHED_MORNING);
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());
    fireEvent.press(screen.getByLabelText(MARK));
    await waitFor(() => expect(screen.getByLabelText(UNDO)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(UNDO));

    await waitFor(() => {
      expect(readHabit(store, HabitIdEnum.MORNING_DETOX).markedDone).toBe(false);
    });
    const days = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');
    expect(days[TODAY].completedHabits).toBe(0);
  });
});

describe('a timed rule', () => {
  it('can be marked done too, since a timer cannot be started in the past', async () => {
    const store = renderHabit(HabitIdEnum.SKILL, {
      [HabitIdEnum.SKILL]: { completed: false, value: 5 },
    });
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => expect(readHabit(store, HabitIdEnum.SKILL).markedDone).toBe(true));
    expect(readHabit(store, HabitIdEnum.SKILL).value).toBe(5);
  });
});

describe('what the numbers say once a rule is marked done', () => {
  it('shows the water target met, not the half litre that was logged', async () => {
    renderHabit(HabitIdEnum.WATER, {
      [HabitIdEnum.WATER]: { completed: false, value: 0.5 },
    });
    await waitFor(() => expect(screen.getByText('0.5 / 3 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => expect(screen.getByText('3 / 3 L')).toBeTruthy());
  });

  it('shows the full time on a timer that was never run', async () => {
    renderHabit(HabitIdEnum.SKILL, {
      [HabitIdEnum.SKILL]: { completed: false, value: 5 },
    });
    await waitFor(() => expect(screen.getByText('05:00')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => expect(screen.getByText('45:00')).toBeTruthy());
  });

  it('fills both detox windows, which is what marking the morning done means', async () => {
    const NINETY_FIVE_MINUTES = 95 * 60 * 1000;

    renderHabit(HabitIdEnum.MORNING_DETOX, {
      [HabitIdEnum.MORNING_DETOX]: {
        completed: false,
        wokeUpAt: new Date(NOW.getTime() - NINETY_FIVE_MINUTES).toISOString(),
        phoneFreeMinutes: 60,
        noContentMinutes: 95,
      },
    });
    await waitFor(() => expect(screen.getByText('1:35:00 / 3:00:00')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(MARK));

    await waitFor(() => expect(screen.getByText('3:00:00 / 3:00:00')).toBeTruthy());
  });

  it('puts the real numbers back when the mark comes off', async () => {
    renderHabit(HabitIdEnum.WATER, {
      [HabitIdEnum.WATER]: { completed: false, value: 0.5 },
    });
    await waitFor(() => expect(screen.getByLabelText(MARK)).toBeTruthy());
    fireEvent.press(screen.getByLabelText(MARK));
    await waitFor(() => expect(screen.getByText('3 / 3 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(UNDO));

    await waitFor(() => expect(screen.getByText('0.5 / 3 L')).toBeTruthy());
  });
});
