import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { addCalendarDays } from '@/domain/calendar';
import { JournalScreen } from '@/features/journal/JournalScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { toLocalIsoDate } from '@/utils/DateUtility';

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

const NOW = new Date('2026-09-08T12:00:00.000Z');

/** Derived, not hardcoded: the app buckets by local date, and the test must say the same thing
 *  in every timezone. */
const TODAY = toLocalIsoDate(NOW);
const AN_EARLIER_DAY = addCalendarDays(TODAY, -2) ?? TODAY;

const readJournal = (store: InMemoryKeyValueStore) =>
  JSON.parse(store.snapshot()[StorageKeyEnum.JOURNAL] ?? '{}');

const renderJournal = (
  seed?: string,
  overrides?: Partial<KeyValueStore>,
): InMemoryKeyValueStore => {
  const inner = createInMemoryKeyValueStore();

  if (seed !== undefined) {
    inner.seed(StorageKeyEnum.JOURNAL, seed);
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
      <JournalScreen />
    </RepositoryProvider>,
  );

  return inner;
};

const HOW_WAS_YOUR_DAY = 'How was your day?';
const SAVE = 'Save this entry';

describe('writing an entry', () => {
  it('saves it without leaving the screen', async () => {
    const store = renderJournal();
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), 'Hard day but I finished.');
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(readJournal(store)[TODAY]?.content).toBe('Hard day but I finished.');
    });
    expect(screen.getByText('Saved on this phone')).toBeTruthy();
  });

  it('trims what was typed, so trailing whitespace is not an answer', async () => {
    const store = renderJournal();
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), '   spaced out   ');
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(readJournal(store)[TODAY]?.content).toBe('spaced out');
    });
  });

  it('keeps a very long entry rather than truncating it', async () => {
    const store = renderJournal();
    const long = 'a'.repeat(20000);
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), long);
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(readJournal(store)[TODAY]?.content).toHaveLength(20000);
    });
  });
});

describe('an empty entry', () => {
  it('cannot be saved', async () => {
    renderJournal();

    await waitFor(() => {
      expect(screen.getByLabelText(SAVE).props.accessibilityState.disabled).toBe(true);
    });
  });

  it('is never written to storage, so the history stays free of blanks', async () => {
    const store = renderJournal();
    await waitFor(() => expect(screen.getByLabelText(SAVE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(store.snapshot()[StorageKeyEnum.JOURNAL]).toBeUndefined();
    });
  });

  it('stays unsaveable when only whitespace was typed', async () => {
    renderJournal();
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), '    ');

    await waitFor(() => {
      expect(screen.getByLabelText(SAVE).props.accessibilityState.disabled).toBe(true);
    });
  });
});

describe('editing an entry that already exists', () => {
  const existing = JSON.stringify({
    [TODAY]: {
      content: 'first thoughts',
      whatWentWell: 'water',
      whatWasDifficult: '',
      tomorrowGoal: '',
      createdAt: NOW.toISOString(),
    },
  });

  it('loads what was written before', async () => {
    renderJournal(existing);

    await waitFor(() => {
      expect(screen.getByLabelText(HOW_WAS_YOUR_DAY).props.value).toBe('first thoughts');
    });
  });

  it('replaces the entry rather than adding a second one for the same day', async () => {
    const store = renderJournal(existing);
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), 'second thoughts');
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(readJournal(store)[TODAY]?.content).toBe('second thoughts');
    });
    expect(Object.keys(readJournal(store))).toEqual([TODAY]);
  });

  it('keeps the fields it did not touch', async () => {
    const store = renderJournal(existing);
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), 'second thoughts');
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(readJournal(store)[TODAY]?.whatWentWell).toBe('water');
    });
  });
});

describe('earlier entries', () => {
  it('lists the days before today, and not today itself', async () => {
    renderJournal(
      JSON.stringify({
        [AN_EARLIER_DAY]: {
          content: 'two days ago',
          whatWentWell: '',
          whatWasDifficult: '',
          tomorrowGoal: '',
          createdAt: NOW.toISOString(),
        },
        [TODAY]: {
          content: 'today',
          whatWentWell: '',
          whatWasDifficult: '',
          tomorrowGoal: '',
          createdAt: NOW.toISOString(),
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('two days ago')).toBeTruthy();
    });
    expect(screen.queryByText('today')).toBeNull();
  });

  it('says so when there are none yet', async () => {
    renderJournal();

    await waitFor(() => {
      expect(screen.getByText('Your earlier entries will appear here.')).toBeTruthy();
    });
  });
});

describe('when the entry cannot be saved', () => {
  it('says so rather than appearing to have saved it', async () => {
    renderJournal(undefined, {
      set: async () => {
        throw new Error('Disk full');
      },
    });
    await waitFor(() => expect(screen.getByLabelText(HOW_WAS_YOUR_DAY)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText(HOW_WAS_YOUR_DAY), 'something');
    fireEvent.press(screen.getByLabelText(SAVE));

    await waitFor(() => {
      expect(screen.getByText('That entry was not saved. Try again.')).toBeTruthy();
    });
    expect(screen.queryByText('Saved on this phone')).toBeNull();
  });
});
