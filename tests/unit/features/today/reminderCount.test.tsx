import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';
import { TodayScreen } from '@/features/today/TodayScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';
import {
  createInMemoryNotificationScheduler,
  InMemoryNotificationScheduler,
} from '../../../support/storage/inMemoryNotificationScheduler';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: () => undefined,
  Redirect: () => null,
}));

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

const renderToday = (): InMemoryNotificationScheduler => {
  const store = createInMemoryKeyValueStore();
  const notifications = createInMemoryNotificationScheduler();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  store.seed(
    StorageKeyEnum.SETTINGS,
    JSON.stringify({ ...DEFAULT_SETTINGS, notificationsEnabled: true }),
  );

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store,
        files: createInMemoryFileStore(),
        transport: createInMemoryBackupTransport(),
        notifications,
        clock: { now: () => NOW },
      })}
    >
      <TodayScreen />
    </RepositoryProvider>,
  );

  return notifications;
};

const readEveningTitle = (notifications: InMemoryNotificationScheduler): string | undefined =>
  notifications.scheduled().find((one) => one.id === 'evening')?.title;

describe('the evening reminder', () => {
  it('starts the day saying nothing has been done', async () => {
    const notifications = renderToday();

    await waitFor(() => expect(readEveningTitle(notifications)).toBe('0 of 6 done'));
  });

  it('follows the count as rules are ticked off, rather than staying as it was set', async () => {
    const notifications = renderToday();
    await waitFor(() => expect(readEveningTitle(notifications)).toBe('0 of 6 done'));

    fireEvent.press(screen.getByLabelText('No alcohol & no cigarettes'));

    await waitFor(() => expect(readEveningTitle(notifications)).toBe('1 of 6 done'));
  });

  it('never stacks a second copy of itself', async () => {
    const notifications = renderToday();
    await waitFor(() => expect(readEveningTitle(notifications)).toBeDefined());

    fireEvent.press(screen.getByLabelText('No alcohol & no cigarettes'));

    await waitFor(() => expect(readEveningTitle(notifications)).toBe('1 of 6 done'));
    expect(notifications.scheduled()).toHaveLength(2);
  });
});

describe('when the phone refuses notifications', () => {
  it('still records the habit, because a reminder is never worth a lost tap', async () => {
    const store = createInMemoryKeyValueStore();
    const notifications = createInMemoryNotificationScheduler();
    notifications.denyPermission();

    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
    store.seed(
      StorageKeyEnum.SETTINGS,
      JSON.stringify({ ...DEFAULT_SETTINGS, notificationsEnabled: true }),
    );

    render(
      <RepositoryProvider
        repositories={buildRepositories({
          store,
          files: createInMemoryFileStore(),
          transport: createInMemoryBackupTransport(),
          notifications,
          clock: { now: () => NOW },
        })}
      >
        <TodayScreen />
      </RepositoryProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText('No alcohol & no cigarettes')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('No alcohol & no cigarettes'));

    await waitFor(() => {
      const stored = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

      expect(stored[TODAY]?.habits?.[HabitIdEnum.NO_ALCOHOL]?.completed).toBe(true);
    });
  });
});
