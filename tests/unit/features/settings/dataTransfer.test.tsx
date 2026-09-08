import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';

import { addCalendarDays } from '@/domain/calendar';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { APP_ID, SCHEMA_VERSION } from '@/domain/export/schema';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum, DayRecord } from '@/domain/types';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { formatLongDate, toLocalIsoDate } from '@/utils/DateUtility';

import {
  createInMemoryBackupTransport,
  InMemoryBackupTransport,
} from '../../../support/storage/inMemoryBackupTransport';
import {
  createInMemoryFileStore,
  InMemoryFileStore,
} from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

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
const START_DATE = addCalendarDays(TODAY, -11) ?? TODAY;

const PERFECT_DAY = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'fixtures', 'perfect_day.json'), 'utf8'),
) as DayRecord;

const CHALLENGE = {
  startDate: START_DATE,
  mode: ChallengeModeEnum.MEDIUM,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 6,
  longestStreak: 9,
  status: ChallengeStatusEnum.ACTIVE,
};

const PROFILE = { name: 'Vangelis', createdAt: '2026-01-01T00:00:00.000Z' };

const AN_ENTRY = {
  content: 'a hard day',
  whatWentWell: 'water',
  whatWasDifficult: 'the second workout',
  tomorrowGoal: 'sleep earlier',
  createdAt: NOW.toISOString(),
};

const IMPORTED_START = '2026-03-01';

const IMPORTED_CHALLENGE = {
  startDate: IMPORTED_START,
  mode: ChallengeModeEnum.HARD,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 3,
  longestStreak: 4,
  status: ChallengeStatusEnum.ACTIVE,
};

const buildBackup = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: '2026-05-01T10:00:00.000Z',
    profile: { name: 'Someone else', createdAt: '2026-02-01T00:00:00.000Z' },
    challenge: IMPORTED_CHALLENGE,
    days: { [IMPORTED_START]: PERFECT_DAY },
    journal: {},
    settings: DEFAULT_SETTINGS,
    ...overrides,
  });

const PICKED_URI = 'file:///documents/picked-backup.json';
const PICKED_PATH = 'picked-backup.json';

type Harness = {
  store: InMemoryKeyValueStore;
  files: InMemoryFileStore;
  transport: InMemoryBackupTransport;
};

const renderSettings = (overrides?: Partial<KeyValueStore>): Harness => {
  const store = createInMemoryKeyValueStore();
  const files = createInMemoryFileStore();
  const transport = createInMemoryBackupTransport();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  store.seed(StorageKeyEnum.DAYS, JSON.stringify({ [START_DATE]: PERFECT_DAY }));
  store.seed(StorageKeyEnum.JOURNAL, JSON.stringify({ [START_DATE]: AN_ENTRY }));
  store.seed(StorageKeyEnum.PROFILE, JSON.stringify(PROFILE));
  store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store: { ...store, ...(overrides ?? {}) },
        files,
        transport,
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => NOW },
      })}
    >
      <SettingsScreen />
    </RepositoryProvider>,
  );

  return { store, files, transport };
};

const readKey = (store: InMemoryKeyValueStore, key: string): unknown => {
  const raw = store.snapshot()[key];

  return raw === undefined ? undefined : JSON.parse(raw);
};

const EXPORT = 'Export your data';
const IMPORT = 'Import a backup';
const REPLACE = 'Replace';

const waitForSettings = async () => {
  await waitFor(() => expect(screen.getByLabelText(EXPORT)).toBeTruthy());
};

const offerBackup = async (harness: Harness, contents: string) => {
  await harness.files.writeText(PICKED_PATH, contents);
  harness.transport.setPickedUri(PICKED_URI);
  fireEvent.press(screen.getByLabelText(IMPORT));
};

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
});

describe('exporting', () => {
  it('hands a file named for today to the share sheet', async () => {
    const { transport } = renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(EXPORT));

    await waitFor(() => expect(transport.shared()).toHaveLength(1));
    expect(transport.shared()[0]?.fileName).toBe(`75gang-backup-${TODAY}.json`);
  });

  it('writes the five storage keys under the header from the spec', async () => {
    const { files } = renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(EXPORT));

    await waitFor(() => {
      expect(files.snapshot()[`backups/75gang-backup-${TODAY}.json`]).toBeDefined();
    });

    const written = JSON.parse(files.snapshot()[`backups/75gang-backup-${TODAY}.json`] ?? '{}');
    expect(written.app).toBe(APP_ID);
    expect(written.schemaVersion).toBe(SCHEMA_VERSION);
    expect(written.exportedAt).toBe(NOW.toISOString());
    expect(written.profile).toEqual(PROFILE);
    expect(written.challenge).toEqual(CHALLENGE);
    expect(written.days).toEqual({ [START_DATE]: PERFECT_DAY });
    expect(written.journal).toEqual({ [START_DATE]: AN_ENTRY });
    expect(written.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('leaves every stored key exactly as it was, because export is read-only', async () => {
    const { store } = renderSettings();
    await waitForSettings();
    const before = { ...store.snapshot() };

    fireEvent.press(screen.getByLabelText(EXPORT));

    await waitFor(() => expect(screen.getByText('Your backup was shared.')).toBeTruthy());
    expect(store.snapshot()).toEqual(before);
  });

  it('round-trips: what it writes is a file it would accept back', async () => {
    const harness = renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(EXPORT));
    await waitFor(() => expect(harness.transport.shared()).toHaveLength(1));

    const exported = harness.files.snapshot()[`backups/75gang-backup-${TODAY}.json`] ?? '';
    await offerBackup(harness, exported);

    await waitFor(() => {
      expect(screen.getByText('Replace everything with this backup?')).toBeTruthy();
    });
  });

  it('says so when the data could not be read, rather than sharing half a backup', async () => {
    const { transport } = renderSettings({
      get: async (key) => {
        if (key === StorageKeyEnum.DAYS) {
          throw new Error('Storage unavailable');
        }

        return null;
      },
    });
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(EXPORT));

    await waitFor(() => {
      expect(
        screen.getByText('Your data could not be exported. Nothing on this phone changed.'),
      ).toBeTruthy();
    });
    expect(transport.shared()).toHaveLength(0);
  });
});

describe('choosing a file to import', () => {
  it('describes the backup before replacing anything', async () => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(harness, buildBackup());

    await waitFor(() => {
      expect(
        screen.getByText(
          `The backup holds a Hard challenge that started on ${formatLongDate(
            IMPORTED_START,
            'en',
          )}. Importing replaces your current challenge, every day you have recorded and every ` +
            'journal entry with what is in the file. Your progress photos stay where they are. ' +
            'This cannot be undone.',
        ),
      ).toBeTruthy();
    });
  });

  it('writes nothing until the replacement is confirmed', async () => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(harness, buildBackup());

    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());
    expect(readKey(harness.store, StorageKeyEnum.CHALLENGE)).toEqual(CHALLENGE);
    expect(readKey(harness.store, StorageKeyEnum.DAYS)).toEqual({ [START_DATE]: PERFECT_DAY });
  });

  it('changes nothing when the confirmation is cancelled', async () => {
    const harness = renderSettings();
    await waitForSettings();
    await offerBackup(harness, buildBackup());
    await waitFor(() => expect(screen.getByLabelText('Cancel')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Replace everything with this backup?')).toBeNull();
    });
    expect(readKey(harness.store, StorageKeyEnum.CHALLENGE)).toEqual(CHALLENGE);
    expect(readKey(harness.store, StorageKeyEnum.JOURNAL)).toEqual({ [START_DATE]: AN_ENTRY });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('does nothing at all when the picker is dismissed', async () => {
    const { transport } = renderSettings();
    await waitForSettings();
    transport.setPickedUri(null);

    fireEvent.press(screen.getByLabelText(IMPORT));

    await waitFor(() => expect(screen.getByLabelText(EXPORT)).toBeTruthy());
    expect(screen.queryByText('Replace everything with this backup?')).toBeNull();
  });
});

describe('confirming the import', () => {
  it('replaces every one of the five keys with what was in the file', async () => {
    const harness = renderSettings();
    await waitForSettings();
    await offerBackup(harness, buildBackup());
    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(REPLACE));

    await waitFor(() => {
      expect(readKey(harness.store, StorageKeyEnum.CHALLENGE)).toEqual(IMPORTED_CHALLENGE);
    });
    expect(readKey(harness.store, StorageKeyEnum.DAYS)).toEqual({ [IMPORTED_START]: PERFECT_DAY });
    expect(readKey(harness.store, StorageKeyEnum.JOURNAL)).toEqual({});
    expect(readKey(harness.store, StorageKeyEnum.PROFILE)).toEqual({
      name: 'Someone else',
      createdAt: '2026-02-01T00:00:00.000Z',
    });
  });

  it('replaces rather than merges, so the old days do not survive alongside the new', async () => {
    const harness = renderSettings();
    await waitForSettings();
    await offerBackup(harness, buildBackup());
    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(REPLACE));

    await waitFor(() => {
      expect(Object.keys(readKey(harness.store, StorageKeyEnum.DAYS) as object)).toEqual([
        IMPORTED_START,
      ]);
    });
  });

  it('reloads to Today, on the day the imported challenge is really on', async () => {
    const harness = renderSettings();
    await waitForSettings();
    await offerBackup(harness, buildBackup());
    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(REPLACE));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/today'));
  });

  it('leaves the progress photos alone, since a backup cannot put one back', async () => {
    const harness = renderSettings();
    await harness.files.write('photos/2026-09-01.jpg', 'file:///camera/one.jpg');
    await waitForSettings();
    await offerBackup(harness, buildBackup());
    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(REPLACE));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalled());
    expect(harness.files.snapshot()['photos/2026-09-01.jpg']).toBe('file:///camera/one.jpg');
  });

  it('says the photos stay, so the confirmation is accurate about them', async () => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(harness, buildBackup());

    await waitFor(() => {
      expect(screen.getByText(/Your progress photos stay where they are/)).toBeTruthy();
    });
  });
});

describe('a file the app will not accept', () => {
  it.each([
    ['not json at all', 'That file could not be read as JSON, so it is not a backup.'],
    [JSON.stringify({ app: 'anotherapp' }), 'That file was not made by 75 G-ANG.'],
  ])('is refused with its own reason', async (contents, message) => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(harness, contents);

    await waitFor(() => expect(screen.getByText(message)).toBeTruthy());
  });

  it('names the version problem when the backup is newer than this build', async () => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(harness, buildBackup({ schemaVersion: SCHEMA_VERSION + 1 }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'That backup was made by a newer version of the app. Update 75 G-ANG and try again.',
        ),
      ).toBeTruthy();
    });
  });

  it('names the challenge problem when the start date is not a real date', async () => {
    const harness = renderSettings();
    await waitForSettings();

    await offerBackup(
      harness,
      buildBackup({ challenge: { ...IMPORTED_CHALLENGE, startDate: '2026-02-30' } }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'That backup has no usable challenge in it, so there is nothing to restore.',
        ),
      ).toBeTruthy();
    });
  });

  it('leaves every stored key untouched when it is refused', async () => {
    const harness = renderSettings();
    await waitForSettings();
    const before = { ...harness.store.snapshot() };

    await offerBackup(harness, 'not json at all');

    await waitFor(() => {
      expect(
        screen.getByText('That file could not be read as JSON, so it is not a backup.'),
      ).toBeTruthy();
    });
    expect(harness.store.snapshot()).toEqual(before);
  });

  it('says so when the chosen file cannot be opened at all', async () => {
    const { transport } = renderSettings();
    await waitForSettings();
    transport.setPickedUri('file:///documents/gone.json');

    fireEvent.press(screen.getByLabelText(IMPORT));

    await waitFor(() => {
      expect(screen.getByText('That file could not be opened. Choose it again.')).toBeTruthy();
    });
  });
});

describe('an import that fails halfway', () => {
  it('puts back everything that was there', async () => {
    const store = createInMemoryKeyValueStore();
    const files = createInMemoryFileStore();
    const transport = createInMemoryBackupTransport();

    store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
    store.seed(StorageKeyEnum.DAYS, JSON.stringify({ [START_DATE]: PERFECT_DAY }));
    store.seed(StorageKeyEnum.JOURNAL, JSON.stringify({ [START_DATE]: AN_ENTRY }));
    store.seed(StorageKeyEnum.PROFILE, JSON.stringify(PROFILE));
    store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

    const before = { ...store.snapshot() };

    render(
      <RepositoryProvider
        repositories={buildRepositories({
          store: {
            ...store,
            set: async (key, value) => {
              if (key === StorageKeyEnum.JOURNAL) {
                throw new Error('Disk full');
              }

              await store.set(key, value);
            },
          },
          files,
          transport,
          notifications: createInMemoryNotificationScheduler(),
          clock: { now: () => NOW },
        })}
      >
        <SettingsScreen />
      </RepositoryProvider>,
    );

    await waitForSettings();
    await offerBackup({ store, files, transport }, buildBackup());
    await waitFor(() => expect(screen.getByLabelText(REPLACE)).toBeTruthy());

    fireEvent.press(screen.getByLabelText(REPLACE));

    await waitFor(() => {
      expect(
        screen.getByText('The import did not finish. Everything you had was put back.'),
      ).toBeTruthy();
    });
    expect(store.snapshot()).toEqual(before);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
