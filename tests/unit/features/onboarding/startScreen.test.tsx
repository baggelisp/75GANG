import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { StartChallengeScreen } from '@/features/onboarding/StartChallengeScreen';
import {
  decideStartDateError,
  EARLIEST_START_OFFSET_DAYS,
  StartErrorEnum,
} from '@/features/onboarding/_hooks/useStartChallenge';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  Redirect: () => null,
}));

const TODAY = new Date('2026-09-07T09:00:00.000Z');

const renderStartScreen = (): InMemoryKeyValueStore => {
  const store = createInMemoryKeyValueStore();
  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    clock: { now: () => TODAY },
  });

  render(
    <RepositoryProvider repositories={repositories}>
      <StartChallengeScreen />
    </RepositoryProvider>,
  );

  return store;
};

describe('decideStartDateError bounds', () => {
  it('accepts the earliest date that still leaves a day of the challenge to live', () => {
    expect(decideStartDateError('2026-06-26', '2026-09-07')).toBeNull();
  });

  it('rejects a start date so far back that the challenge would already be over', () => {
    expect(decideStartDateError('2026-05-30', '2026-09-07')).toBe(
      StartErrorEnum.START_DATE_TOO_FAR_BACK,
    );
  });

  it('bounds the challenge at 74 days back', () => {
    expect(EARLIEST_START_OFFSET_DAYS).toBe(74);
  });
});

describe('the start screen', () => {
  it('offers a name field that is optional', async () => {
    renderStartScreen();

    expect(screen.getByPlaceholderText('Optional')).toBeTruthy();
  });

  it('starts on today and disables moving the date forward', () => {
    renderStartScreen();

    const later = screen.getByLabelText('Later');

    expect(later.props.accessibilityState.disabled).toBe(true);
  });

  it('moves the start date back a day at a time', () => {
    renderStartScreen();

    fireEvent.press(screen.getByLabelText('Earlier'));

    expect(screen.getByLabelText('Later').props.accessibilityState.disabled).toBe(false);
  });

  it('writes the challenge and leaves the start screen when Start is pressed', async () => {
    const store = renderStartScreen();

    fireEvent.press(screen.getByLabelText('Start the 75 day challenge'));

    await waitFor(() => {
      expect(store.snapshot()[StorageKeyEnum.CHALLENGE]).toBeDefined();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows a readable message instead of starting when a challenge already exists', async () => {
    const store = createInMemoryKeyValueStore();
    store.seed(
      StorageKeyEnum.CHALLENGE,
      JSON.stringify({
        startDate: '2026-07-10',
        totalDays: 75,
        currentStreak: 41,
        longestStreak: 41,
        status: 'active',
      }),
    );

    const repositories = buildRepositories({
      store,
      files: createInMemoryFileStore(),
      clock: { now: () => TODAY },
    });

    render(
      <RepositoryProvider repositories={repositories}>
        <StartChallengeScreen />
      </RepositoryProvider>,
    );

    fireEvent.press(screen.getByLabelText('Start the 75 day challenge'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(JSON.parse(store.snapshot()[StorageKeyEnum.CHALLENGE] ?? '{}').currentStreak).toBe(41);
  });
});
