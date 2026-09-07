import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ChallengeModeEnum } from '@/domain/modes';
import { TodayScreen } from '@/features/today/TodayScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Redirect: () => null,
}));

const TODAY = '2026-09-07';
const NOW = new Date('2026-09-07T09:00:00.000Z');

const CHALLENGE = JSON.stringify({
  startDate: '2026-08-27',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 0,
  longestStreak: 0,
  status: 'active',
});

const readStoredDay = (store: InMemoryKeyValueStore) =>
  JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY];

const renderToday = (overrides?: Partial<KeyValueStore>) => {
  const inner = createInMemoryKeyValueStore();
  inner.seed(StorageKeyEnum.CHALLENGE, CHALLENGE);

  const store = { ...inner, ...(overrides ?? {}) };

  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    clock: { now: () => NOW },
  });

  render(
    <RepositoryProvider repositories={repositories}>
      <TodayScreen />
    </RepositoryProvider>,
  );

  return inner;
};

const NO_ALCOHOL = 'No alcohol & no cigarettes';
const NO_DEVICES = 'No devices in bed';
const DIET = 'Healthy diet';

describe('tapping a rule', () => {
  it('marks it done on screen', async () => {
    renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(screen.getByLabelText(NO_ALCOHOL).props.accessibilityState.checked).toBe(true);
    });
  });

  it('persists the day record, so the tap survives a reload', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(readStoredDay(store)?.habits['no-alcohol'].completed).toBe(true);
    });
  });

  it('recomputes the stored counts rather than editing them', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(readStoredDay(store)?.completedHabits).toBe(1);
    });
    expect(readStoredDay(store)?.totalHabits).toBe(11);
    expect(readStoredDay(store)?.completionPercentage).toBe(9);
    expect(readStoredDay(store)?.perfectDay).toBe(false);
  });

  it('turns it off again when tapped twice', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));
    await waitFor(() => expect(readStoredDay(store)?.completedHabits).toBe(1));

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(readStoredDay(store)?.completedHabits).toBe(0);
    });
    expect(readStoredDay(store)?.habits['no-alcohol'].completed).toBe(false);
  });

  it('updates the day total on screen', async () => {
    renderToday();
    await waitFor(() => expect(screen.getByText('0 / 11')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(screen.getByText('1 / 11')).toBeTruthy();
    });
  });
});

describe('two taps landing together', () => {
  it('keeps both habits, rather than the second overwriting the first', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));
    fireEvent.press(screen.getByLabelText(NO_DEVICES));
    fireEvent.press(screen.getByLabelText(DIET));

    await waitFor(() => {
      expect(readStoredDay(store)?.completedHabits).toBe(3);
    });
    expect(Object.keys(readStoredDay(store)?.habits ?? {}).sort()).toEqual([
      'diet',
      'no-alcohol',
      'no-devices-bed',
    ]);
  });
});

describe('when the write fails', () => {
  const failingWrites = (): Partial<KeyValueStore> => ({
    set: async () => {
      throw new Error('Disk full');
    },
  });

  it('says the tap was not saved', async () => {
    renderToday(failingWrites());
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(screen.getByText('That tap was not saved. Tap again to retry.')).toBeTruthy();
    });
  });

  it('never shows the rule as done, because the write comes before the state', async () => {
    renderToday(failingWrites());
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(screen.getByText('That tap was not saved. Tap again to retry.')).toBeTruthy();
    });
    expect(screen.getByLabelText(NO_ALCOHOL).props.accessibilityState.checked).toBe(false);
    expect(screen.getByText('0 / 11')).toBeTruthy();
  });
});

describe('the diet rule', () => {
  it('surfaces the 22:00 cut-off, which the checkbox alone cannot express', async () => {
    renderToday();

    await waitFor(() => {
      expect(screen.getByText('No cheat meal. Nothing after 22:00.')).toBeTruthy();
    });
  });
});

describe('two taps on the same rule', () => {
  it('turns it on and straight back off, rather than losing the undo', async () => {
    const store = renderToday();
    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));
    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(store.writeCount()).toBeGreaterThanOrEqual(2);
    });
    expect(readStoredDay(store)?.habits['no-alcohol'].completed).toBe(false);
    expect(readStoredDay(store)?.completedHabits).toBe(0);
  });
});

describe('a screen left open across midnight', () => {
  it('files the tap under the day it was actually made', async () => {
    const inner = createInMemoryKeyValueStore();
    inner.seed(StorageKeyEnum.CHALLENGE, CHALLENGE);

    const clock = { value: new Date('2026-09-07T20:59:00.000Z') };
    const repositories = buildRepositories({
      store: inner,
      files: createInMemoryFileStore(),
      clock: { now: () => clock.value },
    });

    render(
      <RepositoryProvider repositories={repositories}>
        <TodayScreen />
      </RepositoryProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText(NO_ALCOHOL)).toBeTruthy());

    clock.value = new Date('2026-09-08T20:59:00.000Z');
    fireEvent.press(screen.getByLabelText(NO_ALCOHOL));

    await waitFor(() => {
      expect(inner.snapshot()[StorageKeyEnum.DAYS]).toBeDefined();
    });

    const stored = JSON.parse(inner.snapshot()[StorageKeyEnum.DAYS] ?? '{}');

    expect(Object.keys(stored)).toEqual(['2026-09-08']);
    expect(stored['2026-09-08'].updatedAt).toBe('2026-09-08T20:59:00.000Z');
  });
});
