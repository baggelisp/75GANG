import { createInMemoryNotificationScheduler } from '../../../support/storage/inMemoryNotificationScheduler';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';
import { FileStore } from '@/storage/ports/fileStore';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');

  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    Redirect: () => null,
  };
});

const TODAY = '2026-09-08';
const NOW = new Date('2026-09-08T09:00:00.000Z');

const CHALLENGE = JSON.stringify({
  startDate: '2026-08-28',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 0,
  longestStreak: 0,
  status: 'active',
});

const readWeighIn = (store: InMemoryKeyValueStore) =>
  JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY]?.habits?.[HabitIdEnum.WEIGH_IN];

const dayWith = (record: unknown) =>
  JSON.stringify({
    [TODAY]: {
      habits: { [HabitIdEnum.WEIGH_IN]: record },
      completedHabits: 0,
      totalHabits: 11,
      completionPercentage: 0,
      perfectDay: false,
      updatedAt: NOW.toISOString(),
    },
  });

const renderWeighIn = (seededDay?: string, files?: FileStore): InMemoryKeyValueStore => {
  const store = createInMemoryKeyValueStore();
  store.seed(StorageKeyEnum.CHALLENGE, CHALLENGE);

  if (seededDay !== undefined) {
    store.seed(StorageKeyEnum.DAYS, seededDay);
  }

  render(
    <RepositoryProvider
      repositories={buildRepositories({
        store,
        files: files ?? createInMemoryFileStore(),
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        clock: { now: () => NOW },
      })}
    >
      <HabitDetailScreen habitId={HabitIdEnum.WEIGH_IN} />
    </RepositoryProvider>,
  );

  return store;
};

describe('the weight', () => {
  it('starts empty when nothing has been recorded', async () => {
    renderWeighIn();

    await waitFor(() => {
      expect(screen.getByLabelText('Weight in kilograms').props.value).toBe('');
    });
  });

  it('records a typed weight to one decimal', async () => {
    const store = renderWeighIn();
    await waitFor(() => expect(screen.getByLabelText('Weight in kilograms')).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText('Weight in kilograms'), '88.437');

    await waitFor(() => {
      expect(readWeighIn(store)?.weightKg).toBe(88.4);
    });
  });

  it('ignores a weight that is not one, rather than storing nonsense', async () => {
    const store = renderWeighIn(dayWith({ completed: false, weightKg: 88.4 }));
    await waitFor(() => expect(screen.getByLabelText('Weight in kilograms')).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText('Weight in kilograms'), '0');

    await waitFor(() => {
      expect(readWeighIn(store)?.weightKg).toBe(88.4);
    });
  });

  it('steps a tenth at a time', async () => {
    const store = renderWeighIn(dayWith({ completed: false, weightKg: 88.4 }));
    await waitFor(() => expect(screen.getByLabelText('Add a tenth of a kilogram')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Add a tenth of a kilogram'));

    await waitFor(() => {
      expect(readWeighIn(store)?.weightKg).toBe(88.5);
    });
  });
});

describe('the photo', () => {
  it('shows a placeholder when none has been taken', async () => {
    renderWeighIn();

    await waitFor(() => {
      expect(screen.getByText('No photo yet')).toBeTruthy();
    });
  });

  /** A restored export, or a cleared cache: the path survives, the file does not. */
  it('shows the placeholder when the file behind the path has gone', async () => {
    const missingFiles: FileStore = {
      ...createInMemoryFileStore(),
      exists: async () => false,
    };

    renderWeighIn(
      dayWith({ completed: false, weightKg: 88.4, photo: 'photos/2026-09-08.jpg' }),
      missingFiles,
    );

    await waitFor(() => {
      expect(screen.getByText('No photo yet')).toBeTruthy();
    });
  });

  it('keeps the weight when the photo file has gone', async () => {
    const missingFiles: FileStore = {
      ...createInMemoryFileStore(),
      exists: async () => false,
    };

    const store = renderWeighIn(
      dayWith({ completed: false, weightKg: 88.4, photo: 'photos/2026-09-08.jpg' }),
      missingFiles,
    );

    await waitFor(() => expect(screen.getByText('No photo yet')).toBeTruthy());
    expect(readWeighIn(store)?.weightKg).toBe(88.4);
  });

  it('shows the photo once its file is there', async () => {
    const files = createInMemoryFileStore();
    await files.write('photos/2026-09-08.jpg', 'file:///tmp/camera.jpg');

    renderWeighIn(
      dayWith({ completed: false, weightKg: 88.4, photo: 'photos/2026-09-08.jpg' }),
      files,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Today's progress photo")).toBeTruthy();
    });
  });
});

describe('rule 9 on screen', () => {
  it('is not complete with only a weight', async () => {
    renderWeighIn(dayWith({ completed: false, weightKg: 88.4 }));

    await waitFor(() => expect(screen.getByText('No photo yet')).toBeTruthy());
    expect(screen.queryByText('Target reached')).toBeNull();
  });

  it('is complete with both the weight and the photo', async () => {
    const files = createInMemoryFileStore();
    await files.write('photos/2026-09-08.jpg', 'file:///tmp/camera.jpg');

    renderWeighIn(
      dayWith({ completed: false, weightKg: 88.4, photo: 'photos/2026-09-08.jpg' }),
      files,
    );

    await waitFor(() => {
      expect(screen.getByText('Target reached')).toBeTruthy();
    });
  });
});
