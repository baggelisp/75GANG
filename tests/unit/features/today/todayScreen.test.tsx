import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { render, screen, waitFor } from '@testing-library/react-native';

import { ChallengeModeEnum } from '@/domain/modes';
import { DayRecord } from '@/domain/types';
import { TodayScreen } from '@/features/today/TodayScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    Redirect: () => null,
  };
});

const NOW = new Date('2026-09-07T09:00:00.000Z');
const TODAY = '2026-09-07';

const challenge = (mode: string, startDate = '2026-08-27') =>
  JSON.stringify({
    startDate,
    mode,
    totalDays: 75,
    currentStreak: 0,
    longestStreak: 0,
    status: 'active',
  });

const dayWith = (habits: DayRecord['habits'], perfectDay = false): string =>
  JSON.stringify({
    [TODAY]: {
      habits,
      completedHabits: 0,
      totalHabits: 11,
      completionPercentage: 0,
      perfectDay,
      updatedAt: '2026-09-07T08:00:00.000Z',
    },
  });

type Seed = {
  challenge?: string;
  profile?: string;
  days?: string;
};

const renderToday = (seed: Seed) => {
  const store = createInMemoryKeyValueStore();

  if (seed.challenge !== undefined) {
    store.seed(StorageKeyEnum.CHALLENGE, seed.challenge);
  }

  if (seed.profile !== undefined) {
    store.seed(StorageKeyEnum.PROFILE, seed.profile);
  }

  if (seed.days !== undefined) {
    store.seed(StorageKeyEnum.DAYS, seed.days);
  }

  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => NOW },
  });

  return render(
    <RepositoryProvider repositories={repositories}>
      <TodayScreen />
    </RepositoryProvider>,
  );
};

describe('the Today screen on day 1 with nothing done', () => {
  it('greets a user by name', async () => {
    renderToday({
      challenge: challenge(ChallengeModeEnum.HARD, TODAY),
      profile: JSON.stringify({ name: 'Vangelis', createdAt: '2026-09-07T08:00:00.000Z' }),
    });

    await waitFor(() => {
      expect(screen.getByText('Hey, Vangelis')).toBeTruthy();
    });
  });

  it('greets a user who never gave a name, without a gap where it would be', async () => {
    renderToday({
      challenge: challenge(ChallengeModeEnum.HARD, TODAY),
      profile: JSON.stringify({ name: null, createdAt: '2026-09-07T08:00:00.000Z' }),
    });

    await waitFor(() => {
      expect(screen.getByText('Hey there')).toBeTruthy();
    });
  });

  it('shows day 1 of 75', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD, TODAY) });

    await waitFor(() => {
      expect(screen.getByText(/Day 1 of 75/)).toBeTruthy();
    });
  });

  it('reports nothing complete', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD, TODAY) });

    await waitFor(() => {
      expect(screen.getByText('0% complete')).toBeTruthy();
    });
    expect(screen.getByText('0 / 11')).toBeTruthy();
  });

  it('lists all eleven rules on the hard challenge', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD, TODAY) });

    await waitFor(() => {
      expect(screen.getByText('No alcohol & no cigarettes')).toBeTruthy();
    });
    expect(screen.getAllByRole('checkbox')).toHaveLength(11);
  });

  it('lists only six rules on the easy challenge', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.EASY, TODAY) });

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    });
    expect(screen.queryByText('Weigh-in & mirror photo')).toBeNull();
  });
});

describe('the Today screen mid-challenge', () => {
  const partialDay = dayWith({
    'no-alcohol': { completed: true },
    diet: { completed: true },
    water: { completed: false, value: 2.5 },
    reading: { completed: false, value: 12 },
  });

  it('derives the day number from the start date rather than a stored value', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: partialDay });

    await waitFor(() => {
      expect(screen.getByText(/Day 12 of 75/)).toBeTruthy();
    });
  });

  it('counts only the habits that meet their target, ignoring the stored count', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: partialDay });

    await waitFor(() => {
      expect(screen.getByText('2 / 11')).toBeTruthy();
    });
  });

  it('shows a measured rule its own progress line', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: partialDay });

    await waitFor(() => {
      expect(screen.getByText('2.5 / 3 L')).toBeTruthy();
    });
    expect(screen.getByText('12 / 15 pages')).toBeTruthy();
  });

  it('marks a completed rule as checked for assistive technology', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: partialDay });

    await waitFor(() => {
      expect(
        screen.getByLabelText('No alcohol & no cigarettes').props.accessibilityState.checked,
      ).toBe(true);
    });
    expect(screen.getByLabelText('Drink 3 litres of water').props.accessibilityState.checked).toBe(
      false,
    );
  });
});

describe('the Today screen on a perfect day', () => {
  const perfectDay = dayWith(
    {
      'no-alcohol': { completed: true },
      diet: { completed: true },
      water: { completed: false, value: 3 },
      workouts: {
        completed: false,
        sessions: [
          { minutes: 45, outdoor: true, completedAt: '2026-09-07T08:00:00.000Z' },
          { minutes: 50, outdoor: false, completedAt: '2026-09-07T18:00:00.000Z' },
        ],
      },
      skill: { completed: false, value: 45 },
      reading: { completed: false, value: 15 },
      'morning-detox': { completed: false, phoneFreeMinutes: 60, noContentMinutes: 180 },
      'no-devices-bed': { completed: true },
      'weigh-in': { completed: false, weightKg: 88.4, photo: 'photos/2026-09-07.jpg' },
      spirituality: { completed: false, value: 15 },
      connection: { completed: false, value: 15 },
    },
    true,
  );

  it('reports eleven of eleven at a hundred percent', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: perfectDay });

    await waitFor(() => {
      expect(screen.getByText('100% complete')).toBeTruthy();
    });
    expect(screen.getByText('11 / 11')).toBeTruthy();
  });

  it('counts the day towards the perfect day total', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: perfectDay });

    await waitFor(() => {
      expect(screen.getByText('Perfect days')).toBeTruthy();
    });
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});

describe('the rings legend', () => {
  it('shows each ring its own fraction, counting only sessions that were long enough', async () => {
    renderToday({
      challenge: challenge(ChallengeModeEnum.HARD),
      days: dayWith({
        water: { completed: false, value: 2.5 },
        workouts: {
          completed: false,
          sessions: [
            { minutes: 48, outdoor: true, completedAt: '2026-09-07T08:00:00.000Z' },
            { minutes: 20, outdoor: false, completedAt: '2026-09-07T18:00:00.000Z' },
          ],
        },
      }),
    });

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeTruthy();
    });
    expect(screen.getByText('2.5/3')).toBeTruthy();
    expect(screen.getAllByText('0/11').length).toBeGreaterThan(0);
  });

  it('uses the mode target, so easy counts water out of two litres', async () => {
    renderToday({
      challenge: challenge(ChallengeModeEnum.EASY),
      days: dayWith({ water: { completed: false, value: 1 } }),
    });

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeTruthy();
    });
  });
});

describe('when the day history cannot be read', () => {
  it('says so instead of showing a streak of zero over an unreadable history', async () => {
    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: '{not json at all' });

    await waitFor(() => {
      expect(screen.getByText('Today could not be loaded')).toBeTruthy();
    });
    expect(screen.queryByText('Perfect days')).toBeNull();
  });
});

describe('a stored perfect-day flag that disagrees with the habits', () => {
  it('is ignored, because the counts are recomputed from what was recorded', async () => {
    const lying = JSON.stringify({
      '2026-09-05': {
        habits: {},
        completedHabits: 11,
        totalHabits: 11,
        completionPercentage: 100,
        perfectDay: true,
        updatedAt: '2026-09-05T21:00:00.000Z',
      },
    });

    renderToday({ challenge: challenge(ChallengeModeEnum.HARD), days: lying });

    await waitFor(() => {
      expect(screen.getByText('Perfect days')).toBeTruthy();
    });
    expect(screen.getByText('0 / 11')).toBeTruthy();
    expect(screen.queryByText('1')).toBeNull();
  });
});
