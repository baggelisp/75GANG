import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
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
import { addDays, formatLongDate, toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
    Redirect: () => null,
  };
});

const TODAY = new Date('2026-09-07T09:00:00.000Z');

/** Derived, not written out: the calendar buckets by local date, in every timezone. */
const TODAY_DATE = toLocalIsoDate(TODAY);

const renderStartScreen = (): InMemoryKeyValueStore => {
  const store = createInMemoryKeyValueStore();
  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
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

  it('opens on today, already chosen', () => {
    renderStartScreen();

    expect(screen.getByText(`Starting ${formatLongDate(TODAY_DATE, 'en')}`)).toBeTruthy();
    expect(
      screen.getByLabelText(formatLongDate(TODAY_DATE, 'en')).props.accessibilityState.selected,
    ).toBe(true);
  });

  it('lets a day be picked straight off the calendar, not one tap at a time', () => {
    renderStartScreen();
    const fourDaysBack = addDays(TODAY_DATE, -4);

    fireEvent.press(screen.getByLabelText(formatLongDate(fourDaysBack, 'en')));

    expect(screen.getByText(`Starting ${formatLongDate(fourDaysBack, 'en')}`)).toBeTruthy();
  });

  it('will not let a day in the future be chosen', () => {
    renderStartScreen();
    const tomorrow = addDays(TODAY_DATE, 1);

    expect(
      screen.getByLabelText(formatLongDate(tomorrow, 'en')).props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('will not step past the month a challenge could still have started in', () => {
    renderStartScreen();

    expect(screen.getByLabelText('Next month').props.accessibilityState.disabled).toBe(true);
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
        mode: 'hard',
        totalDays: 75,
        currentStreak: 41,
        longestStreak: 41,
        status: 'active',
      }),
    );

    const repositories = buildRepositories({
      store,
      files: createInMemoryFileStore(),
      transport: createInMemoryBackupTransport(),
      notifications: createInMemoryNotificationScheduler(),
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

describe('choosing a challenge', () => {
  it('offers all three challenges, each announcing its rule count and summary', () => {
    renderStartScreen();

    expect(screen.getByLabelText(/^Easy\. 6 rules\./)).toBeTruthy();
    expect(screen.getByLabelText(/^Medium\. 9 rules\./)).toBeTruthy();
    expect(screen.getByLabelText(/^Hard\. 11 rules\./)).toBeTruthy();
  });

  it('defaults to Hard, the challenge the app is named after', () => {
    renderStartScreen();

    expect(screen.getByLabelText(/^Hard\./).props.accessibilityState.selected).toBe(true);
  });

  it('stores the challenge the user actually picked', async () => {
    const store = renderStartScreen();

    fireEvent.press(screen.getByLabelText(/^Easy\./));
    fireEvent.press(screen.getByLabelText('Start the 75 day challenge'));

    await waitFor(() => {
      expect(store.snapshot()[StorageKeyEnum.CHALLENGE]).toBeDefined();
    });
    expect(JSON.parse(store.snapshot()[StorageKeyEnum.CHALLENGE] ?? '{}').mode).toBe('easy');
  });
});
