import { render, screen, waitFor } from '@testing-library/react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';
import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    Redirect: () => null,
  };
});

const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);

const UNDRAW = 'unDraw, undraw.co';

const renderSettings = () => {
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
  store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

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
      <SettingsScreen />
    </RepositoryProvider>,
  );
};

describe('the credits', () => {
  it('name where the illustrations came from', async () => {
    renderSettings();

    await waitFor(() => expect(screen.getByText(UNDRAW)).toBeTruthy());
  });

  it('name the icon set and the typefaces too', async () => {
    renderSettings();

    await waitFor(() => expect(screen.getByText(UNDRAW)).toBeTruthy());
    expect(screen.getByText('AntDesign, through @expo/vector-icons')).toBeTruthy();
    expect(screen.getByText('Archivo and Manrope, from Google Fonts')).toBeTruthy();
  });

  it('sit under their own heading, at the end of the settings', async () => {
    renderSettings();

    await waitFor(() => expect(screen.getByText('Credits')).toBeTruthy());
  });
});

describe('onboarding', () => {
  it('carries no credit, because the first thing a new user reads is not a colophon', () => {
    render(<OnboardingScreen />);

    expect(screen.queryByText(UNDRAW)).toBeNull();
    expect(screen.queryByText('Credits')).toBeNull();
  });
});
