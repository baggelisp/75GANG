import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';

import { addCalendarDays } from '@/domain/calendar';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum, DayRecord } from '@/domain/types';
import { DayDetailScreen } from '@/features/day-detail/DayDetailScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';
import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useFocusEffect: () => undefined,
  Redirect: () => null,
}));

const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);
const START_DATE = addCalendarDays(TODAY, -10) ?? TODAY;

const PERFECT_DAY = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

const dayBefore = (offset: number): string => addCalendarDays(TODAY, -offset) ?? TODAY;

const renderDay = (date: string) => {
  const store = createInMemoryKeyValueStore();

  store.seed(
    StorageKeyEnum.CHALLENGE,
    JSON.stringify({
      startDate: START_DATE,
      mode: ChallengeModeEnum.HARD,
      totalDays: CHALLENGE_LENGTH_DAYS,
      currentStreak: 0,
      longestStreak: 0,
      status: ChallengeStatusEnum.ACTIVE,
    }),
  );
  store.seed(StorageKeyEnum.DAYS, JSON.stringify({ [dayBefore(3)]: PERFECT_DAY }));

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
      <DayDetailScreen date={date} />
    </RepositoryProvider>,
  );
};

beforeEach(() => {
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
});

describe('a day that was recorded', () => {
  it('says which day of the challenge it was', async () => {
    renderDay(dayBefore(3));

    await waitFor(() => expect(screen.getByText('Day 8 of 75')).toBeTruthy());
  });

  it('carries the year, since a challenge can run across one', async () => {
    renderDay(dayBefore(3));

    await waitFor(() => expect(screen.getByText(/2026/)).toBeTruthy());
  });

  it('shows what was met', async () => {
    renderDay(dayBefore(3));

    await waitFor(() => expect(screen.getByText('11 of 11 rules')).toBeTruthy());
  });
});

describe('walking through the days', () => {
  it('goes to the day before', async () => {
    renderDay(dayBefore(3));
    await waitFor(() => expect(screen.getByLabelText('The day before')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('The day before'));

    expect(mockRouter.replace).toHaveBeenCalledWith(`/day/${dayBefore(4)}`);
  });

  it('goes to the day after', async () => {
    renderDay(dayBefore(3));
    await waitFor(() => expect(screen.getByLabelText('The day after')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('The day after'));

    expect(mockRouter.replace).toHaveBeenCalledWith(`/day/${dayBefore(2)}`);
  });

  it('stops at the first day of the challenge', async () => {
    renderDay(START_DATE);

    await waitFor(() => {
      expect(screen.getByLabelText('The day before').props.accessibilityState.disabled).toBe(true);
    });
  });

  it('stops at today, because tomorrow has not happened', async () => {
    renderDay(TODAY);

    await waitFor(() => {
      expect(screen.getByLabelText('The day after').props.accessibilityState.disabled).toBe(true);
    });
  });
});

describe('a day with nothing recorded', () => {
  it('shows the rules as unmet rather than an error', async () => {
    renderDay(dayBefore(5));

    await waitFor(() => expect(screen.getByText('0 of 11 rules')).toBeTruthy());
  });
});
