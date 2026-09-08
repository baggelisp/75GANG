import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

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
const SEVEN = '2026-09-07T07:00:00.000Z';

const CHALLENGE = JSON.stringify({
  startDate: '2026-08-27',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 0,
  longestStreak: 0,
  status: 'active',
});

const readDetox = (store: InMemoryKeyValueStore) =>
  JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY]?.habits?.[
    HabitIdEnum.MORNING_DETOX
  ];

type Harness = { store: InMemoryKeyValueStore; setNow: (moment: string) => void };

const renderDetox = (seededDay?: string, startAt = '2026-09-07T07:00:00.000Z'): Harness => {
  const store = createInMemoryKeyValueStore();
  store.seed(StorageKeyEnum.CHALLENGE, CHALLENGE);

  if (seededDay !== undefined) {
    store.seed(StorageKeyEnum.DAYS, seededDay);
  }

  const clock = { value: new Date(startAt) };

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store,
        files: createInMemoryFileStore(),
        clock: { now: () => clock.value },
      })}
    >
      <HabitDetailScreen habitId={HabitIdEnum.MORNING_DETOX} />
    </RepositoryProvider>,
  );

  return {
    store,
    setNow: (moment) => {
      clock.value = new Date(moment);
    },
  };
};

const dayWithDetox = (record: unknown) =>
  JSON.stringify({
    [TODAY]: {
      habits: { [HabitIdEnum.MORNING_DETOX]: record },
      completedHabits: 0,
      totalHabits: 11,
      completionPercentage: 0,
      perfectDay: false,
      updatedAt: SEVEN,
    },
  });

describe('before waking up', () => {
  it('offers only the wake-up button', async () => {
    renderDetox();

    await waitFor(() => {
      expect(screen.getByLabelText('Start the morning windows from now')).toBeTruthy();
    });
    expect(screen.queryByText('No phone')).toBeNull();
  });
});

describe('after waking up', () => {
  it('starts both windows from the one moment', async () => {
    const harness = renderDetox();
    await waitFor(() =>
      expect(screen.getByLabelText('Start the morning windows from now')).toBeTruthy(),
    );

    fireEvent.press(screen.getByLabelText('Start the morning windows from now'));

    await waitFor(() => {
      expect(readDetox(harness.store)?.wokeUpAt).toBe(SEVEN);
    });
    expect(screen.getByText('No phone')).toBeTruthy();
    expect(screen.getByText('No content')).toBeTruthy();
  });

  it('does not restart a morning already under way', async () => {
    const harness = renderDetox(
      dayWithDetox({ completed: false, wokeUpAt: SEVEN, phoneFreeMinutes: 0, noContentMinutes: 0 }),
      '2026-09-07T08:00:00.000Z',
    );

    await waitFor(() => {
      expect(readDetox(harness.store)?.wokeUpAt).toBe(SEVEN);
    });
    expect(screen.queryByLabelText('Start the morning windows from now')).toBeNull();
  });

  it('can be reset when the morning was recorded by mistake', async () => {
    const harness = renderDetox(
      dayWithDetox({ completed: false, wokeUpAt: SEVEN, phoneFreeMinutes: 0, noContentMinutes: 0 }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Reset the morning windows and start again')).toBeTruthy(),
    );

    fireEvent.press(screen.getByLabelText('Reset the morning windows and start again'));

    await waitFor(() => {
      expect(readDetox(harness.store)?.wokeUpAt).toBeNull();
    });
  });
});

describe('windows that elapsed while the app was closed', () => {
  it('credits an hour of the phone window', async () => {
    const harness = renderDetox(
      dayWithDetox({ completed: false, wokeUpAt: SEVEN, phoneFreeMinutes: 0, noContentMinutes: 0 }),
      '2026-09-07T08:00:00.000Z',
    );

    await waitFor(() => {
      expect(readDetox(harness.store)?.phoneFreeMinutes).toBe(60);
    });
    expect(readDetox(harness.store)?.noContentMinutes).toBe(60);
  });

  it('is still incomplete with the content window one minute short', async () => {
    const harness = renderDetox(
      dayWithDetox({ completed: false, wokeUpAt: SEVEN, phoneFreeMinutes: 0, noContentMinutes: 0 }),
      '2026-09-07T09:59:00.000Z',
    );

    await waitFor(() => {
      expect(readDetox(harness.store)?.noContentMinutes).toBe(179);
    });
    expect(screen.queryByText('Target reached')).toBeNull();
  });

  it('completes the rule once both windows have finished', async () => {
    const harness = renderDetox(
      dayWithDetox({ completed: false, wokeUpAt: SEVEN, phoneFreeMinutes: 0, noContentMinutes: 0 }),
      '2026-09-07T10:00:00.000Z',
    );

    await waitFor(() => {
      expect(screen.getByText('Target reached')).toBeTruthy();
    });
    expect(readDetox(harness.store)?.noContentMinutes).toBe(180);
    expect(
      JSON.parse(harness.store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY].completedHabits,
    ).toBe(1);
  });
});
