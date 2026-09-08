import { act, render, screen, waitFor } from '@testing-library/react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum } from '@/domain/types';
import { TodayScreen } from '@/features/today/TodayScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';
import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';

/**
 * Stands in for the navigator. `focus()` fires every registered focus callback, which is what
 * expo-router does when a tab is returned to from a detail screen.
 */
const focusCallbacks: (() => void)[] = [];
const focus = () => focusCallbacks.forEach((run) => run());

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useFocusEffect: (effect: () => void) => {
      useEffect(() => {
        effect();
        focusCallbacks.push(effect);

        return () => {
          focusCallbacks.length = 0;
        };
      }, [effect]);
    },
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    Redirect: () => null,
  };
});

const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);

const CHALLENGE = {
  startDate: TODAY,
  mode: ChallengeModeEnum.EASY,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 0,
  longestStreak: 0,
  status: ChallengeStatusEnum.ACTIVE,
};

const dayWith = (litres: number) => ({
  [TODAY]: {
    habits: { water: { completed: false, value: litres } },
    completedHabits: 0,
    totalHabits: 6,
    completionPercentage: 0,
    perfectDay: false,
    updatedAt: NOW.toISOString(),
  },
});

const renderToday = () => {
  const store = createInMemoryKeyValueStore();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  store.seed(StorageKeyEnum.DAYS, JSON.stringify(dayWith(0.5)));

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
      <TodayScreen />
    </RepositoryProvider>,
  );

  return store;
};

beforeEach(() => {
  focusCallbacks.length = 0;
});

describe('coming back from a habit screen', () => {
  it('shows what was recorded while away, not the count from before', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByText('0.5 / 2 L')).toBeTruthy());

    // What the water screen would have written while Today sat mounted behind it.
    store.seed(StorageKeyEnum.DAYS, JSON.stringify(dayWith(1.5)));
    act(() => {
      focus();
    });

    await waitFor(() => expect(screen.getByText('1.5 / 2 L')).toBeTruthy());
  });

  it('updates the rings and the tiles too, not only the rule row', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByText('0.5 / 2 L')).toBeTruthy());

    store.seed(
      StorageKeyEnum.DAYS,
      JSON.stringify({
        [TODAY]: {
          habits: {
            water: { completed: false, value: 2 },
            'no-alcohol': { completed: true },
          },
          completedHabits: 0,
          totalHabits: 6,
          completionPercentage: 0,
          perfectDay: false,
          updatedAt: NOW.toISOString(),
        },
      }),
    );
    act(() => {
      focus();
    });

    await waitFor(() => expect(screen.getByText('2 / 6')).toBeTruthy());
  });
});
