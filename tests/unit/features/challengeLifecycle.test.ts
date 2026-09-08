import { createInMemoryNotificationScheduler } from '../../support/storage/inMemoryNotificationScheduler';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';
import { resetChallenge, restartChallenge } from '@/features/shared/challengeLifecycle';
import { buildPhotoPath } from '@/storage/photoPaths';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../support/storage/inMemoryKeyValueStore';

const NOW = new Date('2026-09-08T09:00:00.000Z');

const A_DAY = '2026-08-01';
const ANOTHER_DAY = '2026-08-02';

const SEEDED_CHALLENGE = {
  startDate: A_DAY,
  mode: ChallengeModeEnum.HARD,
  totalDays: CHALLENGE_LENGTH_DAYS,
  currentStreak: 6,
  longestStreak: 9,
  status: ChallengeStatusEnum.ACTIVE,
};

const A_PERFECT_DAY = {
  habits: {},
  completedHabits: 11,
  totalHabits: 11,
  completionPercentage: 100,
  perfectDay: true,
  updatedAt: NOW.toISOString(),
};

const AN_ENTRY = {
  content: 'a hard day',
  whatWentWell: 'water',
  whatWasDifficult: 'the second workout',
  tomorrowGoal: 'sleep earlier',
  createdAt: NOW.toISOString(),
};

const seedEverything = () => {
  const store = createInMemoryKeyValueStore();
  const files = createInMemoryFileStore();

  store.seed(StorageKeyEnum.CHALLENGE, JSON.stringify(SEEDED_CHALLENGE));
  store.seed(StorageKeyEnum.DAYS, JSON.stringify({ [A_DAY]: A_PERFECT_DAY }));
  store.seed(StorageKeyEnum.JOURNAL, JSON.stringify({ [A_DAY]: AN_ENTRY }));
  store.seed(StorageKeyEnum.PROFILE, JSON.stringify({ name: 'Vangelis', createdAt: A_DAY }));
  store.seed(StorageKeyEnum.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

  return {
    store,
    files,
    repositories: buildRepositories({
      store,
      files,
      transport: createInMemoryBackupTransport(),
      notifications: createInMemoryNotificationScheduler(),
      clock: { now: () => NOW },
    }),
  };
};

describe('resetting the challenge', () => {
  it('clears the challenge, the days and the journal', async () => {
    const { store, repositories } = seedEverything();

    await resetChallenge(repositories);

    const remaining = store.snapshot();
    expect(remaining[StorageKeyEnum.CHALLENGE]).toBeUndefined();
    expect(remaining[StorageKeyEnum.DAYS]).toBeUndefined();
    expect(remaining[StorageKeyEnum.JOURNAL]).toBeUndefined();
  });

  it('keeps the profile and the settings, so nothing has to be given twice', async () => {
    const { store, repositories } = seedEverything();

    await resetChallenge(repositories);

    const remaining = store.snapshot();
    expect(JSON.parse(remaining[StorageKeyEnum.PROFILE] ?? 'null')).toEqual({
      name: 'Vangelis',
      createdAt: A_DAY,
    });
    expect(JSON.parse(remaining[StorageKeyEnum.SETTINGS] ?? 'null')).toEqual(DEFAULT_SETTINGS);
  });

  it('deletes the progress photos, which no longer belong to any challenge', async () => {
    const { files, repositories } = seedEverything();
    await files.write(buildPhotoPath(A_DAY), 'file:///camera/one.jpg');
    await files.write(buildPhotoPath(ANOTHER_DAY), 'file:///camera/two.jpg');

    await resetChallenge(repositories);

    expect(files.snapshot()).toEqual({});
  });

  it('still clears the records when the photo directory cannot be removed', async () => {
    const { store, files, repositories } = seedEverything();
    const failing = {
      ...repositories,
      files: {
        transport: createInMemoryBackupTransport(),
        notifications: createInMemoryNotificationScheduler(),
        ...files,
        removeDirectory: async () => {
          throw new Error('Directory is busy');
        },
      },
    };

    await resetChallenge(failing);

    expect(store.snapshot()[StorageKeyEnum.DAYS]).toBeUndefined();
  });
});

describe('restarting the challenge', () => {
  const TODAY = '2026-09-08';

  it('writes a challenge that begins on the new start date', async () => {
    const { store, repositories } = seedEverything();

    await restartChallenge(repositories, TODAY, ChallengeModeEnum.MEDIUM);

    expect(JSON.parse(store.snapshot()[StorageKeyEnum.CHALLENGE] ?? 'null')).toEqual({
      startDate: TODAY,
      mode: ChallengeModeEnum.MEDIUM,
      totalDays: CHALLENGE_LENGTH_DAYS,
      currentStreak: 0,
      longestStreak: 0,
      status: ChallengeStatusEnum.ACTIVE,
    });
  });

  it('leaves no day records behind, so the new day one is really day one', async () => {
    const { store, repositories } = seedEverything();

    await restartChallenge(repositories, TODAY, ChallengeModeEnum.HARD);

    expect(store.snapshot()[StorageKeyEnum.DAYS]).toBeUndefined();
  });

  it('carries no streak over from the challenge it replaced', async () => {
    const { store, repositories } = seedEverything();

    await restartChallenge(repositories, TODAY, ChallengeModeEnum.HARD);

    const written = JSON.parse(store.snapshot()[StorageKeyEnum.CHALLENGE] ?? 'null');
    expect(written.currentStreak).toBe(0);
    expect(written.longestStreak).toBe(0);
  });

  describe('when the new challenge cannot be written', () => {
    const buildFailing = () => {
      const { store, files } = seedEverything();

      return {
        store,
        repositories: buildRepositories({
          store: {
            ...store,
            set: async () => {
              throw new Error('Disk full');
            },
          },
          files,
          transport: createInMemoryBackupTransport(),
          notifications: createInMemoryNotificationScheduler(),
          clock: { now: () => NOW },
        }),
      };
    };

    it('reports failure', async () => {
      const { repositories } = buildFailing();

      expect(await restartChallenge(repositories, TODAY, ChallengeModeEnum.HARD)).toBe(false);
    });

    it('leaves the challenge it could not replace exactly as it was', async () => {
      const { store, repositories } = buildFailing();

      await restartChallenge(repositories, TODAY, ChallengeModeEnum.HARD);

      expect(JSON.parse(store.snapshot()[StorageKeyEnum.CHALLENGE] ?? 'null')).toEqual(
        SEEDED_CHALLENGE,
      );
    });

    it('leaves the days and the journal intact, rather than erasing them for nothing', async () => {
      const { store, repositories } = buildFailing();

      await restartChallenge(repositories, TODAY, ChallengeModeEnum.HARD);

      expect(JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? 'null')).toEqual({
        [A_DAY]: A_PERFECT_DAY,
      });
      expect(JSON.parse(store.snapshot()[StorageKeyEnum.JOURNAL] ?? 'null')).toEqual({
        [A_DAY]: AN_ENTRY,
      });
    });

    it('keeps the progress photos, which belong to the challenge that is still running', async () => {
      const { store, repositories } = buildFailing();
      const files = createInMemoryFileStore();
      await files.write(buildPhotoPath(A_DAY), 'file:///camera/one.jpg');

      await restartChallenge({ ...repositories, files }, TODAY, ChallengeModeEnum.HARD);

      expect(Object.keys(files.snapshot())).toEqual([buildPhotoPath(A_DAY)]);
      expect(store.snapshot()[StorageKeyEnum.CHALLENGE]).toBeDefined();
    });
  });
});
