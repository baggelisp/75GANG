import { calculateDayCompletion } from './completion';
import { ChallengeMode } from './modes';
import { DayRecord, HabitRecord, IsoTimestamp } from './types';

export type DayRecordChange = {
  readonly habitId: string;
  readonly record: HabitRecord;
};

export const EMPTY_HABITS: Record<string, HabitRecord> = {};

/**
 * Rebuilds a day record with one habit changed.
 *
 * The counts are always **recomputed** from the habits and never edited in place, so the stored
 * projection cannot drift from what the user recorded — which is exactly the divergence that made
 * a day claim eleven of eleven with nothing in it.
 */
export const applyHabitChange = (
  current: DayRecord | null,
  change: DayRecordChange,
  mode: ChallengeMode,
  updatedAt: IsoTimestamp,
): DayRecord => {
  const habits = {
    ...(current?.habits ?? EMPTY_HABITS),
    [change.habitId]: change.record,
  };

  const completion = calculateDayCompletion(habits, mode);

  return {
    habits,
    completedHabits: completion.completedHabits,
    totalHabits: completion.totalHabits,
    completionPercentage: completion.completionPercentage,
    perfectDay: completion.perfectDay,
    updatedAt,
  };
};

/** Flips a simple tap habit, keeping anything else already recorded against it. */
export const toggleTapHabit = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  completed: !(record?.completed ?? false),
});
