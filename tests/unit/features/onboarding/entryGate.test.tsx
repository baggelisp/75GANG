import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { render, screen, waitFor } from '@testing-library/react-native';

import {
  decideEntryDestination,
  EntryDestinationEnum,
} from '@/features/entry/decideEntryDestination';
import { ChallengeLookupEnum } from '@/features/entry/_hooks/useExistingChallenge';
import { EntryScreen } from '@/features/entry/EntryScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
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
    Redirect: ({ href }: { href: string }) => {
      const { Text: MockText } = jest.requireActual('react-native');

      return <MockText>{`redirected to ${href}`}</MockText>;
    },
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  };
});

const TO_ONBOARDING = 'redirected to /onboarding';
const TO_TODAY = 'redirected to /today';

const A_LIVE_CHALLENGE = JSON.stringify({
  startDate: '2026-07-10',
  mode: 'hard',
  totalDays: 75,
  currentStreak: 41,
  longestStreak: 41,
  status: 'active',
});

const renderEntryOver = (store: KeyValueStore) => {
  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => new Date('2026-09-07T09:00:00.000Z') },
  });

  return render(
    <RepositoryProvider repositories={repositories}>
      <EntryScreen />
    </RepositoryProvider>,
  );
};

describe('decideEntryDestination', () => {
  it.each([
    [ChallengeLookupEnum.LOADING, EntryDestinationEnum.WAITING],
    [ChallengeLookupEnum.NONE, EntryDestinationEnum.ONBOARDING],
    [ChallengeLookupEnum.FOUND, EntryDestinationEnum.CHALLENGE],
    [ChallengeLookupEnum.UNREADABLE, EntryDestinationEnum.UNREADABLE],
  ])('sends %s to %s', (status, expected) => {
    expect(decideEntryDestination(status)).toBe(expected);
  });
});

describe('the entry gate over a real store', () => {
  it('sends a first-time user to onboarding', async () => {
    renderEntryOver(createInMemoryKeyValueStore());

    await waitFor(() => {
      expect(screen.getByText(TO_ONBOARDING)).toBeTruthy();
    });
  });

  it('never sends a returning user to onboarding again', async () => {
    const store = createInMemoryKeyValueStore();
    store.seed(StorageKeyEnum.CHALLENGE, A_LIVE_CHALLENGE);

    renderEntryOver(store);

    await waitFor(() => {
      expect(screen.getByText(TO_TODAY)).toBeTruthy();
    });
    expect(screen.queryByText(TO_ONBOARDING)).toBeNull();
  });

  /**
   * The important one. A device read that simply failed must not look like "no challenge", or a
   * single tap on Start replaces a live challenge with a fresh day 1.
   */
  it('never offers onboarding when the challenge exists but could not be read', async () => {
    const inner = createInMemoryKeyValueStore();
    inner.seed(StorageKeyEnum.CHALLENGE, A_LIVE_CHALLENGE);

    const failing: KeyValueStore = {
      ...inner,
      get: async () => {
        throw new Error('AsyncStorage unavailable');
      },
    };

    renderEntryOver(failing);

    await waitFor(() => {
      expect(screen.getByText('Your challenge could not be opened')).toBeTruthy();
    });
    expect(screen.queryByText(TO_ONBOARDING)).toBeNull();
  });
});
