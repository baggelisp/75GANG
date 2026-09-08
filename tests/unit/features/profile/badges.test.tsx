import { render, screen, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';

import { addCalendarDays } from '@/domain/calendar';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum, DayRecord, DayRecordsByDate } from '@/domain/types';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
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

const PERFECT_DAY = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

const MISSED_DAY: DayRecord = {
  habits: {},
  completedHabits: 0,
  totalHabits: 11,
  completionPercentage: 0,
  perfectDay: false,
  updatedAt: NOW.toISOString(),
};

const dayBefore = (offset: number): string => addCalendarDays(TODAY, -offset) ?? TODAY;

/** `pattern` reads left to right, oldest day first: 'P' perfect, '.' missed. */
const buildHistory = (pattern: string): DayRecordsByDate =>
  Object.fromEntries(
    pattern
      .split('')
      .map((mark, index) => [
        dayBefore(pattern.length - 1 - index),
        mark === 'P' ? PERFECT_DAY : MISSED_DAY,
      ]),
  );

const renderProfile = (currentDay: number, history: DayRecordsByDate) => {
  const store = createInMemoryKeyValueStore();

  store.seed(
    StorageKeyEnum.CHALLENGE,
    JSON.stringify({
      startDate: dayBefore(currentDay - 1),
      mode: ChallengeModeEnum.HARD,
      totalDays: CHALLENGE_LENGTH_DAYS,
      currentStreak: 0,
      longestStreak: 0,
      status: ChallengeStatusEnum.ACTIVE,
    }),
  );
  store.seed(StorageKeyEnum.DAYS, JSON.stringify(history));

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
      <ProfileScreen />
    </RepositoryProvider>,
  );

  return store;
};

const expectState = async (badge: string, state: string) => {
  await waitFor(() => expect(screen.getByLabelText(`${badge}, ${state}`)).toBeTruthy());
};

describe('the badge list', () => {
  it('shows all five, earned or not, so there is something to aim at', async () => {
    renderProfile(1, {});

    await waitFor(() => expect(screen.getByText('7 Day Warrior')).toBeTruthy());
    expect(screen.getByText('Perfect Week')).toBeTruthy();
    expect(screen.getByText('30 Day Discipline')).toBeTruthy();
    expect(screen.getByText('Halfway There')).toBeTruthy();
    expect(screen.getByText('75 Hard Complete')).toBeTruthy();
  });

  it('counts how many have been earned', async () => {
    renderProfile(1, {});

    await waitFor(() => expect(screen.getByText('0 of 5')).toBeTruthy());
  });

  it('says earned or not in words, so the state survives greyscale', async () => {
    renderProfile(7, buildHistory('PPPPPPP'));

    await expectState('7 Day Warrior', 'Earned');
    await expectState('30 Day Discipline', 'Not yet');
  });
});

describe('7 Day Warrior', () => {
  it('is earned on the seventh perfect day in a row', async () => {
    renderProfile(7, buildHistory('PPPPPPP'));

    await expectState('7 Day Warrior', 'Earned');
  });

  it('is not earned on the sixth', async () => {
    renderProfile(6, buildHistory('PPPPPP'));

    await expectState('7 Day Warrior', 'Not yet');
  });
});

describe('Perfect Week', () => {
  it('needs seven perfect days, not seven days', async () => {
    renderProfile(7, buildHistory('PPPPPPP'));

    await expectState('Perfect Week', 'Earned');
  });

  it('is not earned by living through seven days without finishing any', async () => {
    renderProfile(7, buildHistory('.......'));

    await expectState('Perfect Week', 'Not yet');
  });

  it('counts perfect days that were not consecutive, unlike the warrior badge', async () => {
    renderProfile(9, buildHistory('PPP.PPPP'));

    await expectState('Perfect Week', 'Earned');
    await expectState('7 Day Warrior', 'Not yet');
  });
});

describe('30 Day Discipline', () => {
  it('is earned on day thirty however those days went', async () => {
    renderProfile(30, {});

    await expectState('30 Day Discipline', 'Earned');
  });

  it('is not earned on day twenty-nine', async () => {
    renderProfile(29, {});

    await expectState('30 Day Discipline', 'Not yet');
  });
});

describe('Halfway There', () => {
  it('is earned on day thirty-eight', async () => {
    renderProfile(38, {});

    await expectState('Halfway There', 'Earned');
  });

  it('is not earned on day thirty-seven', async () => {
    renderProfile(37, {});

    await expectState('Halfway There', 'Not yet');
  });
});

describe('after the challenge is erased', () => {
  it('every badge is unearned again, because none of them was ever stored', async () => {
    renderProfile(38, buildHistory('PPPPPPP'));
    await expectState('Halfway There', 'Earned');

    screen.unmount();
    renderProfile(1, {});

    await expectState('Halfway There', 'Not yet');
    expect(screen.getByText('0 of 5')).toBeTruthy();
  });
});
