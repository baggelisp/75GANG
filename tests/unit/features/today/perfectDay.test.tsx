import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { ChallengeStatusEnum } from '@/domain/types';
import { CELEBRATION_MILLISECONDS } from '@/features/today/_hooks/usePerfectDayCelebration';
import { TodayScreen } from '@/features/today/TodayScreen';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../../support/storage/inMemoryKeyValueStore';
import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: () => undefined,
  Redirect: () => null,
}));

const NOW = new Date(2026, 8, 8, 12, 0, 0, 0);
const TODAY = toLocalIsoDate(NOW);

/** Easy is six boolean-or-simple rules, so a perfect day is reachable by tapping. */
const CHALLENGE = {
  startDate: TODAY,
  mode: ChallengeModeEnum.EASY,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 0,
  longestStreak: 0,
  status: ChallengeStatusEnum.ACTIVE,
};

const EASY_RULES = [
  'No alcohol & no cigarettes',
  '3 litres of water',
  '2 workouts of 45 minutes',
  '15 pages of a book',
  'No devices in bed',
  '15 minutes of spirituality',
];

const renderToday = (habits: Record<string, unknown>) => {
  const store = createInMemoryKeyValueStore();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  store.seed(
    StorageKeyEnum.DAYS,
    JSON.stringify({
      [TODAY]: {
        habits,
        completedHabits: 0,
        totalHabits: 6,
        completionPercentage: 0,
        perfectDay: false,
        updatedAt: NOW.toISOString(),
      },
    }),
  );

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

const PERFECT_DAY_TITLE = 'Perfect day';

/** Every rule but the last is met; tapping the last one is what completes the day. */
const oneRuleShort = () => ({
  'no-alcohol': { completed: true },
  water: { completed: true, value: 3 },
  workouts: {
    completed: true,
    sessions: [
      { minutes: 45, outdoor: true, completedAt: NOW.toISOString() },
      { minutes: 45, outdoor: false, completedAt: NOW.toISOString() },
    ],
  },
  reading: { completed: true, value: 20 },
  spirituality: { completed: true, value: 20 },
  'no-devices-bed': { completed: false },
});

beforeEach(() => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('completing the last rule of the day', () => {
  it('celebrates', async () => {
    renderToday(oneRuleShort());
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());
    expect(screen.queryByText(PERFECT_DAY_TITLE)).toBeNull();

    fireEvent.press(screen.getByLabelText('No devices in bed'));

    await waitFor(() => expect(screen.getByText(PERFECT_DAY_TITLE)).toBeTruthy());
  });

  it('names the day and the number of rules met', async () => {
    renderToday(oneRuleShort());
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('No devices in bed'));

    await waitFor(() => {
      expect(screen.getByText('All 6 rules on day 1. That is the whole point.')).toBeTruthy();
    });
  });
});

describe('short of the last rule', () => {
  it('does not celebrate', async () => {
    const twoShort = { ...oneRuleShort(), reading: { completed: false, value: 1 } };
    renderToday(twoShort);
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('No devices in bed'));

    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());
    expect(screen.queryByText(PERFECT_DAY_TITLE)).toBeNull();
  });
});

describe('a day that is already perfect when the screen opens', () => {
  it('does not celebrate again', async () => {
    renderToday({ ...oneRuleShort(), 'no-devices-bed': { completed: true } });

    await waitFor(() => expect(screen.getByText(EASY_RULES[0] ?? '')).toBeTruthy());
    expect(screen.queryByText(PERFECT_DAY_TITLE)).toBeNull();
  });
});

describe('the celebration itself', () => {
  it('can be dismissed by tapping it', async () => {
    renderToday(oneRuleShort());
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('No devices in bed'));
    await waitFor(() => expect(screen.getByText(PERFECT_DAY_TITLE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Dismiss the perfect day message'));

    await waitFor(() => expect(screen.queryByText(PERFECT_DAY_TITLE)).toBeNull());
  });

  it('goes away on its own', async () => {
    jest.useFakeTimers();

    try {
      renderToday(oneRuleShort());
      await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());
      fireEvent.press(screen.getByLabelText('No devices in bed'));
      await waitFor(() => expect(screen.getByText(PERFECT_DAY_TITLE)).toBeTruthy());

      act(() => {
        jest.advanceTimersByTime(CELEBRATION_MILLISECONDS);
      });

      expect(screen.queryByText(PERFECT_DAY_TITLE)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('leaves the rules underneath tappable while it is up', async () => {
    const store = renderToday(oneRuleShort());
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('No devices in bed'));
    await waitFor(() => expect(screen.getByText(PERFECT_DAY_TITLE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText('No alcohol & no cigarettes'));

    await waitFor(() => {
      const stored = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

      expect(stored[TODAY]?.habits?.['no-alcohol']?.completed).toBe(false);
    });
  });
});

describe('with reduce motion turned on', () => {
  it('still says the same thing, without the animation', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    renderToday(oneRuleShort());
    await waitFor(() => expect(screen.getByLabelText('No devices in bed')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('No devices in bed'));

    await waitFor(() => expect(screen.getByText(PERFECT_DAY_TITLE)).toBeTruthy());
    expect(screen.getByText('All 6 rules on day 1. That is the whole point.')).toBeTruthy();
  });
});
