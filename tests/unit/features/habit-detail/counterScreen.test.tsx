import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Redirect: () => null,
}));

const TODAY = '2026-09-07';
const NOW = new Date('2026-09-07T09:00:00.000Z');

const challengeIn = (mode: string) =>
  JSON.stringify({
    startDate: '2026-08-27',
    mode,
    totalDays: 75,
    currentStreak: 0,
    longestStreak: 0,
    status: 'active',
  });

const readValue = (store: InMemoryKeyValueStore, habitId: string): number | undefined =>
  JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY]?.habits?.[habitId]?.value;

const renderDetail = (
  habitId: string,
  mode: string = ChallengeModeEnum.HARD,
  overrides?: Partial<KeyValueStore>,
): InMemoryKeyValueStore => {
  const inner = createInMemoryKeyValueStore();
  inner.seed(StorageKeyEnum.CHALLENGE, challengeIn(mode));

  const repositories = buildRepositories({
    store: { ...inner, ...(overrides ?? {}) },
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => NOW },
  });

  render(
    <RepositoryProvider repositories={repositories}>
      <HabitDetailScreen habitId={habitId} />
    </RepositoryProvider>,
  );

  return inner;
};

describe('the water counter', () => {
  it('starts at zero of three litres', async () => {
    renderDetail(HabitIdEnum.WATER);

    await waitFor(() => {
      expect(screen.getByText('0 / 3 L')).toBeTruthy();
    });
  });

  it('offers the three increments from the spec', async () => {
    renderDetail(HabitIdEnum.WATER);

    await waitFor(() => expect(screen.getByLabelText('+250 ml')).toBeTruthy());
    expect(screen.getByLabelText('+500 ml')).toBeTruthy();
    expect(screen.getByLabelText('+1 L')).toBeTruthy();
  });

  it('persists every increment', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+500 ml')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+500 ml'));

    await waitFor(() => {
      expect(readValue(store, HabitIdEnum.WATER)).toBe(0.5);
    });
  });

  it('does not report the target reached at 2.75 litres', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(1));
    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(2));
    fireEvent.press(screen.getByLabelText('+500 ml'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(2.5));
    fireEvent.press(screen.getByLabelText('+250 ml'));

    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(2.75));
    expect(screen.queryByText('Target reached')).toBeNull();
  });

  it('reports the target reached at three litres', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(1));
    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(2));
    fireEvent.press(screen.getByLabelText('+1 L'));

    await waitFor(() => {
      expect(screen.getByText('Target reached')).toBeTruthy();
    });
  });

  it('keeps a value above the target rather than clamping it away', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    const drinkALitre = async (expected: number) => {
      fireEvent.press(screen.getByLabelText('+1 L'));
      await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(expected));
    };

    await drinkALitre(1);
    await drinkALitre(2);
    await drinkALitre(3);
    await drinkALitre(4);

    expect(screen.getByText('4 / 3 L')).toBeTruthy();
  });

  it('does not let a value above the target push the day percentage over a hundred', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(1));
    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(2));
    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(3));
    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(4));

    const day = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY];

    expect(day.completedHabits).toBe(1);
    expect(day.completionPercentage).toBe(9);
  });

  it('removes 250 ml when undone, which is exactly what the button says', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+1 L'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.WATER)).toBe(1));

    fireEvent.press(screen.getByLabelText('Undo 250 ml'));

    await waitFor(() => {
      expect(readValue(store, HabitIdEnum.WATER)).toBe(0.75);
    });
  });

  it('floors at zero rather than going negative when undone past empty', async () => {
    const store = renderDetail(HabitIdEnum.WATER);
    await waitFor(() => expect(screen.getByLabelText('Undo 250 ml')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Undo 250 ml'));

    await waitFor(() => {
      expect(readValue(store, HabitIdEnum.WATER)).toBe(0);
    });
  });

  it('uses the easy target when that is the challenge', async () => {
    renderDetail(HabitIdEnum.WATER, ChallengeModeEnum.EASY);

    await waitFor(() => {
      expect(screen.getByText('0 / 2 L')).toBeTruthy();
    });
  });
});

describe('the reading counter', () => {
  it('counts pages, not litres', async () => {
    renderDetail(HabitIdEnum.READING);

    await waitFor(() => {
      expect(screen.getByText('0 / 15 pages')).toBeTruthy();
    });
    expect(screen.getByLabelText('+5 pages')).toBeTruthy();
  });

  it('does not report the target reached at fourteen pages', async () => {
    const store = renderDetail(HabitIdEnum.READING);
    await waitFor(() => expect(screen.getByLabelText('+5 pages')).toBeTruthy());

    const readFive = async (expected: number) => {
      fireEvent.press(screen.getByLabelText('+5 pages'));
      await waitFor(() => expect(readValue(store, HabitIdEnum.READING)).toBe(expected));
    };

    await readFive(5);
    await readFive(10);
    fireEvent.press(screen.getByLabelText('+1 page'));
    await waitFor(() => expect(readValue(store, HabitIdEnum.READING)).toBe(11));

    expect(screen.queryByText('Target reached')).toBeNull();
  });
});

describe('every measured rule now has its own tracker', () => {
  it.each([
    HabitIdEnum.WATER,
    HabitIdEnum.READING,
    HabitIdEnum.SKILL,
    HabitIdEnum.WORKOUTS,
    HabitIdEnum.MORNING_DETOX,
    HabitIdEnum.WEIGH_IN,
  ])('never shows %s a raw translation key', async (habitId) => {
    renderDetail(habitId);

    await waitFor(() => {
      expect(screen.queryByText(/today\.progress\./)).toBeNull();
    });
    expect(screen.queryByText('This rule is tracked on the Today screen for now.')).toBeNull();
  });
});

describe('when an increment cannot be saved', () => {
  it('says so rather than leaving the number silently unchanged', async () => {
    renderDetail(HabitIdEnum.WATER, ChallengeModeEnum.HARD, {
      set: async () => {
        throw new Error('Disk full');
      },
    });
    await waitFor(() => expect(screen.getByLabelText('+1 L')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('+1 L'));

    await waitFor(() => {
      expect(screen.getByText('That amount was not saved. Try again.')).toBeTruthy();
    });
    expect(screen.getByText('0 / 3 L')).toBeTruthy();
  });
});

describe('a habit outside the challenge', () => {
  it('says so rather than offering controls for a rule the user does not have', async () => {
    renderDetail(HabitIdEnum.WEIGH_IN, ChallengeModeEnum.EASY);

    await waitFor(() => {
      expect(screen.getByText('This rule is not part of your challenge.')).toBeTruthy();
    });
  });
});
