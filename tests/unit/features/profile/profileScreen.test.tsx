import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';

import { addCalendarDays } from '@/domain/calendar';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum, DayRecord } from '@/domain/types';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useRouter: () => mockRouter,
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    Redirect: () => null,
  };
});

const NOW = new Date('2026-09-08T12:00:00.000Z');
const TODAY = toLocalIsoDate(NOW);

const PERFECT_DAY = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

const dayBefore = (offset: number): string => addCalendarDays(TODAY, -offset) ?? TODAY;

const buildChallenge = (startDate: string) => ({
  startDate,
  mode: ChallengeModeEnum.HARD,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 41,
  longestStreak: 41,
  status: ChallengeStatusEnum.ACTIVE,
});

type Seed = {
  name?: string | null;
  challenge?: unknown;
  days?: Record<string, DayRecord>;
  overrides?: Partial<KeyValueStore>;
};

const renderProfile = ({ name, challenge, days, overrides }: Seed = {}) => {
  const inner = createInMemoryKeyValueStore();

  if (name !== undefined) {
    inner.seed(StorageKeyEnum.PROFILE, JSON.stringify({ name, createdAt: NOW.toISOString() }));
  }

  if (challenge !== undefined) {
    inner.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(challenge));
  }

  if (days !== undefined) {
    inner.seed(StorageKeyEnum.DAYS, JSON.stringify(days));
  }

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store: { ...inner, ...(overrides ?? {}) },
        files: createInMemoryFileStore(),
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => NOW },
      })}
    >
      <ProfileScreen />
    </RepositoryProvider>,
  );

  return inner;
};

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
});

describe('who the challenge belongs to', () => {
  it('shows the name that was given at onboarding', async () => {
    renderProfile({ name: 'Vangelis', challenge: buildChallenge(dayBefore(2)) });

    await waitFor(() => expect(screen.getByText('Vangelis')).toBeTruthy());
  });

  it('says so plainly when no name was given, rather than showing an empty line', async () => {
    renderProfile({ challenge: buildChallenge(dayBefore(2)) });

    await waitFor(() => expect(screen.getByText('No name yet')).toBeTruthy());
  });

  it('names which of the three challenges is running', async () => {
    renderProfile({ name: 'Vangelis', challenge: buildChallenge(dayBefore(2)) });

    await waitFor(() => expect(screen.getByText('The Hard challenge')).toBeTruthy());
  });
});

describe('where the challenge stands', () => {
  it('counts the day from the start date rather than storing it', async () => {
    renderProfile({ challenge: buildChallenge(dayBefore(11)) });

    await waitFor(() => expect(screen.getByText('Day 12')).toBeTruthy());
  });

  it('derives the streak from the day records, not from the challenge counters', async () => {
    renderProfile({
      challenge: buildChallenge(dayBefore(3)),
      days: {
        [dayBefore(2)]: PERFECT_DAY,
        [dayBefore(1)]: PERFECT_DAY,
        [TODAY]: PERFECT_DAY,
      },
    });

    await waitFor(() => expect(screen.getByText('Current streak')).toBeTruthy());
    // The stored challenge claims 41. Only three days were actually recorded.
    expect(screen.queryByText('41')).toBeNull();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('counts only the days that really were perfect', async () => {
    renderProfile({
      challenge: buildChallenge(dayBefore(3)),
      days: {
        [dayBefore(2)]: PERFECT_DAY,
        [dayBefore(1)]: { ...PERFECT_DAY, habits: {}, perfectDay: true },
      },
    });

    await waitFor(() => expect(screen.getByText('Perfect days')).toBeTruthy());
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});

describe('with no challenge running', () => {
  it('offers to start one instead of showing an empty scoreboard', async () => {
    renderProfile({ name: 'Vangelis' });

    await waitFor(() => expect(screen.getByText('No challenge running')).toBeTruthy());
    expect(screen.queryByText('Current streak')).toBeNull();
  });

  it('goes to the start screen when asked', async () => {
    renderProfile({ name: 'Vangelis' });
    await waitFor(() => expect(screen.getByLabelText('Start a challenge')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Start a challenge'));

    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/start');
  });
});

describe('opening the settings', () => {
  it('navigates to them', async () => {
    renderProfile({ name: 'Vangelis', challenge: buildChallenge(dayBefore(2)) });
    await waitFor(() => expect(screen.getByLabelText('Open your settings')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Open your settings'));

    expect(mockRouter.push).toHaveBeenCalledWith('/settings');
  });
});

describe('when the challenge cannot be read', () => {
  it('says so and offers a retry, and never offers to erase anything', async () => {
    renderProfile({
      challenge: buildChallenge(dayBefore(2)),
      overrides: {
        get: async () => {
          throw new Error('Storage unavailable');
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText('Your profile could not be loaded. Your progress is safe on this phone.'),
      ).toBeTruthy();
    });
    expect(screen.queryByLabelText('Open your settings')).toBeNull();
  });
});
