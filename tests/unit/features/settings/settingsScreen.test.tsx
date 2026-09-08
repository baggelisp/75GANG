import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';

import { addCalendarDays } from '@/domain/calendar';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum, DayRecord } from '@/domain/types';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { buildPhotoPath } from '@/storage/photoPaths';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
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

const AN_ENTRY = {
  content: 'a hard day',
  whatWentWell: 'water',
  whatWasDifficult: 'the second workout',
  tomorrowGoal: 'sleep earlier',
  createdAt: NOW.toISOString(),
};

type StoreOverrides =
  Partial<KeyValueStore> | ((inner: InMemoryKeyValueStore) => Partial<KeyValueStore>);

const renderSettings = (overrides?: StoreOverrides) => {
  const inner = createInMemoryKeyValueStore();
  const files = createInMemoryFileStore();

  inner.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));
  inner.seed(StorageKeyEnum.DAYS, JSON.stringify({ [START_DATE]: PERFECT_DAY }));
  inner.seed(StorageKeyEnum.JOURNAL, JSON.stringify({ [START_DATE]: AN_ENTRY }));
  inner.seed(
    StorageKeyEnum.PROFILE,
    JSON.stringify({ name: 'Vangelis', createdAt: '2026-01-01T00:00:00.000Z' }),
  );
  inner.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store: { ...inner, ...resolveOverrides(inner, overrides) },
        files,
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => NOW },
      })}
    >
      <SettingsScreen />
    </RepositoryProvider>,
  );

  return { store: inner, files };
};

const resolveOverrides = (
  inner: InMemoryKeyValueStore,
  overrides?: StoreOverrides,
): Partial<KeyValueStore> => {
  if (overrides === undefined) {
    return {};
  }

  if (typeof overrides === 'function') {
    return overrides(inner);
  }

  return overrides;
};

const readKey = (store: InMemoryKeyValueStore, key: string): unknown => {
  const raw = store.snapshot()[key];

  if (raw === undefined) {
    return undefined;
  }

  return JSON.parse(raw);
};

const RESTART = 'Restart the challenge';
const ERASE = 'Erase your challenge';

const waitForSettings = async () => {
  await waitFor(() => expect(screen.getByLabelText('Daily reminders')).toBeTruthy());
};

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
});

describe('your name', () => {
  it('is saved without replacing the day the profile was created', async () => {
    const { store } = renderSettings();
    await waitFor(() => expect(screen.getByLabelText('Your name').props.value).toBe('Vangelis'));

    fireEvent.changeText(screen.getByLabelText('Your name'), 'Bill');
    fireEvent.press(screen.getByLabelText('Save your name'));

    await waitFor(() => {
      expect(readKey(store, StorageKeyEnum.PROFILE)).toEqual({
        name: 'Bill',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  it('becomes nothing rather than an empty string when it is cleared', async () => {
    const { store } = renderSettings();
    await waitFor(() => expect(screen.getByLabelText('Your name')).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText('Your name'), '   ');
    fireEvent.press(screen.getByLabelText('Save your name'));

    await waitFor(() => {
      expect((readKey(store, StorageKeyEnum.PROFILE) as { name: unknown }).name).toBeNull();
    });
  });
});

describe('reminders', () => {
  it('are off until the user turns them on, and the change is written', async () => {
    const { store } = renderSettings();
    await waitForSettings();

    expect(screen.getByLabelText('Daily reminders').props.accessibilityState.checked).toBe(false);
    fireEvent.press(screen.getByLabelText('Daily reminders'));

    await waitFor(() => {
      expect(
        (readKey(store, StorageKeyEnum.SETTINGS) as { notificationsEnabled: unknown })
          .notificationsEnabled,
      ).toBe(true);
    });
  });

  it('step by half an hour and persist', async () => {
    const { store } = renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText('Daily reminders'));
    await waitFor(() => expect(screen.getByText('07:00')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Morning, half an hour later'));

    await waitFor(() => {
      expect(
        (readKey(store, StorageKeyEnum.SETTINGS) as { morningReminder: unknown }).morningReminder,
      ).toBe('07:30');
    });
    expect(screen.getByText('07:30')).toBeTruthy();
  });

  it('cannot be stepped while reminders are off', async () => {
    const { store } = renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText('Morning, half an hour later'));

    await waitFor(() => expect(screen.getByText('07:00')).toBeTruthy());
    expect(
      (readKey(store, StorageKeyEnum.SETTINGS) as { morningReminder: unknown }).morningReminder,
    ).toBe('07:00');
  });

  it('put the switch back and say so when the change could not be written', async () => {
    renderSettings({
      set: async () => {
        throw new Error('Disk full');
      },
    });
    await waitForSettings();

    fireEvent.press(screen.getByLabelText('Daily reminders'));

    await waitFor(() => {
      expect(screen.getByText('That change was not saved. Try again.')).toBeTruthy();
    });
    expect(screen.getByLabelText('Daily reminders').props.accessibilityState.checked).toBe(false);
  });
});

describe('the theme', () => {
  it('is shown as dark and cannot be changed, because dark is the only theme here', async () => {
    renderSettings();
    await waitForSettings();

    const darkSwitch = screen.getByLabelText('Dark');
    expect(darkSwitch.props.accessibilityState.checked).toBe(true);
    expect(darkSwitch.props.accessibilityState.disabled).toBe(true);
  });
});

describe('erasing the challenge', () => {
  it('changes nothing until it is confirmed', async () => {
    const { store } = renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(ERASE));

    await waitFor(() => expect(screen.getByText('Erase your challenge?')).toBeTruthy());
    expect(readKey(store, StorageKeyEnum.CHALLENGE)).toEqual(CHALLENGE);
    expect(readKey(store, StorageKeyEnum.DAYS)).toEqual({ [START_DATE]: PERFECT_DAY });
  });

  it('says exactly what goes and what stays', async () => {
    renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(ERASE));

    await waitFor(() => {
      expect(
        screen.getByText(
          'You are on day 12. This deletes every day you have recorded, every journal entry and ' +
            'every progress photo. Your name and your settings are kept. This cannot be undone.',
        ),
      ).toBeTruthy();
    });
  });

  it('leaves everything alone when the confirmation is cancelled', async () => {
    const { store } = renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(ERASE));
    await waitFor(() => expect(screen.getByLabelText('Cancel')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Cancel'));

    await waitFor(() => expect(screen.queryByText('Erase your challenge?')).toBeNull());
    expect(readKey(store, StorageKeyEnum.CHALLENGE)).toEqual(CHALLENGE);
    expect(readKey(store, StorageKeyEnum.DAYS)).toEqual({ [START_DATE]: PERFECT_DAY });
    expect(readKey(store, StorageKeyEnum.JOURNAL)).toEqual({ [START_DATE]: AN_ENTRY });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('clears the challenge, the days, the journal and the photos once confirmed', async () => {
    const { store, files } = renderSettings();
    await files.write(buildPhotoPath(START_DATE), 'file:///camera/one.jpg');
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(ERASE));
    await waitFor(() => expect(screen.getByLabelText('Erase')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Erase'));

    await waitFor(() => expect(readKey(store, StorageKeyEnum.CHALLENGE)).toBeUndefined());
    expect(readKey(store, StorageKeyEnum.DAYS)).toBeUndefined();
    expect(readKey(store, StorageKeyEnum.JOURNAL)).toBeUndefined();
    expect(files.snapshot()).toEqual({});
  });

  it('keeps the name and the settings, so nothing has to be given twice', async () => {
    const { store } = renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(ERASE));
    await waitFor(() => expect(screen.getByLabelText('Erase')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Erase'));

    await waitFor(() => expect(readKey(store, StorageKeyEnum.CHALLENGE)).toBeUndefined());
    expect(readKey(store, StorageKeyEnum.PROFILE)).toEqual({
      name: 'Vangelis',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(readKey(store, StorageKeyEnum.SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it('sends the user back to onboarding, where there is a challenge to choose', async () => {
    renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(ERASE));
    await waitFor(() => expect(screen.getByLabelText('Erase')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Erase'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding'));
  });
});

describe('restarting the challenge', () => {
  it('names the challenge that is about to begin', async () => {
    renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText(RESTART));

    await waitFor(() => {
      expect(
        screen.getByText(
          'You are on day 12. Restarting deletes every day you have recorded, every journal ' +
            'entry and every progress photo, and begins a new Medium challenge today. Your name ' +
            'and your settings are kept. This cannot be undone.',
        ),
      ).toBeTruthy();
    });
  });

  it('begins a new challenge today, on the same challenge, with nothing carried over', async () => {
    const { store } = renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(RESTART));
    await waitFor(() => expect(screen.getByLabelText('Restart')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Restart'));

    await waitFor(() => {
      expect(readKey(store, StorageKeyEnum.CHALLENGE)).toEqual({
        startDate: TODAY,
        mode: ChallengeModeEnum.MEDIUM,
        totalDays: CHALLENGE_LENGTH_DAYS,
        currentStreak: 0,
        longestStreak: 0,
        status: ChallengeStatusEnum.ACTIVE,
      });
    });
    expect(readKey(store, StorageKeyEnum.DAYS)).toBeUndefined();
    expect(readKey(store, StorageKeyEnum.JOURNAL)).toBeUndefined();
  });

  it('lands on day one of the new challenge', async () => {
    renderSettings();
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(RESTART));
    await waitFor(() => expect(screen.getByLabelText('Restart')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Restart'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/today'));
  });
});

describe('going back', () => {
  it('returns to the profile', async () => {
    renderSettings();
    await waitForSettings();

    fireEvent.press(screen.getByLabelText('Go back to your profile'));

    expect(mockRouter.back).toHaveBeenCalled();
  });
});

const failOnSettingsRead = (inner: InMemoryKeyValueStore): Partial<KeyValueStore> => ({
  get: async (key) => {
    if (key === StorageKeyEnum.SETTINGS) {
      throw new Error('Storage unavailable');
    }

    return inner.get(key);
  },
});

describe('when the settings cannot be read', () => {
  it('says so instead of showing the defaults as though they were saved', async () => {
    renderSettings(failOnSettingsRead);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Your settings could not be loaded. Nothing here can be changed until they are, so ' +
            'that a guess is never written over what is really on this phone.',
        ),
      ).toBeTruthy();
    });
  });

  it('offers nothing to change, so a guess is never written over the real record', async () => {
    renderSettings(failOnSettingsRead);

    await waitFor(() => expect(screen.getByLabelText('Try again')).toBeTruthy());
    expect(screen.queryByLabelText('Daily reminders')).toBeNull();
    expect(screen.queryByLabelText(ERASE)).toBeNull();
  });

  it('does not treat a settings key that was never written as a failure', async () => {
    const inner = createInMemoryKeyValueStore();
    inner.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(CHALLENGE));

    render(
      <RepositoryProvider
        repositories={buildRepositories({
          store: inner,
          files: createInMemoryFileStore(),
          transport: createInMemoryBackupTransport(),
          notifications: createInMemoryNotificationScheduler(),
          clock: { now: () => NOW },
        })}
      >
        <SettingsScreen />
      </RepositoryProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText('Daily reminders')).toBeTruthy());
    expect(screen.getByText('07:00')).toBeTruthy();
  });
});

describe('when the restart cannot be written', () => {
  const failOnChallengeWrite = (inner: InMemoryKeyValueStore): Partial<KeyValueStore> => ({
    set: async (key, value) => {
      if (key === StorageKeyEnum.CHALLENGE) {
        throw new Error('Disk full');
      }

      await inner.set(key, value);
    },
  });

  it('says so rather than leaving the screen looking as though nothing happened', async () => {
    renderSettings(failOnChallengeWrite);
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(RESTART));
    await waitFor(() => expect(screen.getByLabelText('Restart')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Restart'));

    await waitFor(() => {
      expect(
        screen.getByText('Your challenge could not be started again. Nothing was changed.'),
      ).toBeTruthy();
    });
  });

  it('leaves the challenge and its history exactly as they were', async () => {
    const { store } = renderSettings(failOnChallengeWrite);
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(RESTART));
    await waitFor(() => expect(screen.getByLabelText('Restart')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Restart'));

    await waitFor(() => {
      expect(
        screen.getByText('Your challenge could not be started again. Nothing was changed.'),
      ).toBeTruthy();
    });
    expect(readKey(store, StorageKeyEnum.CHALLENGE)).toEqual(CHALLENGE);
    expect(readKey(store, StorageKeyEnum.DAYS)).toEqual({ [START_DATE]: PERFECT_DAY });
    expect(readKey(store, StorageKeyEnum.JOURNAL)).toEqual({ [START_DATE]: AN_ENTRY });
  });

  it('stays on the settings screen rather than sending the user to a challenge that is gone', async () => {
    renderSettings(failOnChallengeWrite);
    await waitForSettings();
    fireEvent.press(screen.getByLabelText(RESTART));
    await waitFor(() => expect(screen.getByLabelText('Restart')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Restart'));

    await waitFor(() => {
      expect(
        screen.getByText('Your challenge could not be started again. Nothing was changed.'),
      ).toBeTruthy();
    });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
