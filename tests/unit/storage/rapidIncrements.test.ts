import { applyCounterStep } from '@/domain/counters';
import { applyHabitChange } from '@/domain/dayRecord';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { DayRecord } from '@/domain/types';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { expectValue } from '../../support/storage/expectResult';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../support/storage/inMemoryKeyValueStore';

const TODAY = '2026-09-07';
const UPDATED_AT = '2026-09-07T09:00:00.000Z';
const MODE = ChallengeModeEnum.HARD;

const buildRepositoriesOverMemory = () => {
  const store = createInMemoryKeyValueStore();

  return {
    store,
    repositories: buildRepositories({
      store,
      files: createInMemoryFileStore(),
      clock: { now: () => new Date(UPDATED_AT) },
    }),
  };
};

const stepOnce = (
  repositories: ReturnType<typeof buildRepositoriesOverMemory>['repositories'],
  habitId: string,
  amount: number,
) =>
  repositories.days.update(TODAY, (current: DayRecord | null) =>
    applyHabitChange(
      current,
      { habitId, record: applyCounterStep(current?.habits[habitId], amount, 2) },
      MODE,
      UPDATED_AT,
    ),
  );

describe('fifty increments fired without waiting', () => {
  it('all land, because each reads the value the one before it wrote', async () => {
    const { repositories } = buildRepositoriesOverMemory();

    await Promise.all(
      Array.from({ length: 50 }).map(() => stepOnce(repositories, HabitIdEnum.READING, 1)),
    );

    const day = expectValue(await repositories.days.readOne(TODAY));

    expect(day?.habits[HabitIdEnum.READING]?.value).toBe(50);
  });

  it('keeps two habits counted independently when their increments interleave', async () => {
    const { repositories } = buildRepositoriesOverMemory();

    await Promise.all([
      ...Array.from({ length: 12 }).map(() => stepOnce(repositories, HabitIdEnum.WATER, 0.25)),
      ...Array.from({ length: 15 }).map(() => stepOnce(repositories, HabitIdEnum.READING, 1)),
    ]);

    const day = expectValue(await repositories.days.readOne(TODAY));

    expect(day?.habits[HabitIdEnum.WATER]?.value).toBe(3);
    expect(day?.habits[HabitIdEnum.READING]?.value).toBe(15);
  });

  it('recomputes the day once every increment has landed', async () => {
    const { store, repositories } = buildRepositoriesOverMemory();

    await Promise.all(
      Array.from({ length: 12 }).map(() => stepOnce(repositories, HabitIdEnum.WATER, 0.25)),
    );

    const stored = JSON.parse(store.snapshot()[StorageKeyEnum.DAYS] ?? '{}')[TODAY];

    expect(stored.completedHabits).toBe(1);
    expect(stored.totalHabits).toBe(11);
    expect(stored.perfectDay).toBe(false);
  });
});
