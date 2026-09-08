import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
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

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useRouter: () => mockRouter,
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    Redirect: () => null,
  };
});

/** Midday local, so the morning reminder has gone by and the evening one has not. */
const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);

const CHALLENGE = {
  startDate: TODAY,
  mode: ChallengeModeEnum.HARD,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 0,
  longestStreak: 0,
  status: ChallengeStatusEnum.ACTIVE,
};

const renderSettings = (settings: unknown): InMemoryNotificationScheduler => {
  const store = createInMemoryKeyValueStore();
  const notifications = createInMemoryNotificationScheduler();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(settings));

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
      <SettingsScreen />
    </RepositoryProvider>,
  );

  return notifications;
};

const ENABLED = { ...DEFAULT_SETTINGS, notificationsEnabled: true };

const waitForSettings = async () => {
  await waitFor(() => expect(screen.getByLabelText('Daily reminders')).toBeTruthy());
};

describe('turning reminders on', () => {
  it('schedules them there and then, rather than at the next app launch', async () => {
    const notifications = renderSettings(DEFAULT_SETTINGS);
    await waitForSettings();
    expect(notifications.scheduled()).toEqual([]);

    fireEvent.press(screen.getByLabelText('Daily reminders'));

    await waitFor(() => expect(notifications.scheduled()).toHaveLength(2));
  });
});

describe('turning reminders off', () => {
  it('cancels everything the device was holding', async () => {
    const notifications = renderSettings(ENABLED);
    await waitForSettings();

    fireEvent.press(screen.getByLabelText('Daily reminders'));

    await waitFor(() => expect(notifications.scheduled()).toEqual([]));
    expect(notifications.cancelCount()).toBeGreaterThan(0);
  });
});

describe('moving a reminder time', () => {
  it('reschedules to the new time', async () => {
    const notifications = renderSettings(ENABLED);
    await waitForSettings();
    fireEvent.press(screen.getByLabelText('Evening, half an hour later'));

    await waitFor(() => expect(screen.getByText('20:30')).toBeTruthy());
    await waitFor(() => {
      const evening = notifications.scheduled().find((one) => one.id === 'evening');

      expect(evening?.at).toEqual(new Date(2026, 8, 8, 20, 30, 0, 0));
    });
  });
});

describe('erasing the challenge', () => {
  it('cancels the reminders, which now have nothing to remind anyone about', async () => {
    const notifications = renderSettings(ENABLED);
    await waitForSettings();
    fireEvent.press(screen.getByLabelText('Erase your challenge'));
    await waitFor(() => expect(screen.getByLabelText('Erase')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Erase'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding'));
    expect(notifications.scheduled()).toEqual([]);
  });
});

describe('when the phone refuses notifications', () => {
  it('says so and leaves the rest of settings working', async () => {
    const notifications = renderSettings(DEFAULT_SETTINGS);
    notifications.denyPermission();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText('Daily reminders'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Your phone is not allowing reminders. Turn notifications on for 75 G-ANG in your ' +
            'phone settings, and these times take effect.',
        ),
      ).toBeTruthy();
    });
    expect(screen.getByLabelText('Erase your challenge')).toBeTruthy();
  });
});
