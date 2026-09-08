import { Habit } from '@/domain/habits';

/**
 * The standing reminder under a rule whose condition the checkbox cannot express — the diet
 * cut-off, or confirming the bedtime rule at night.
 *
 * Separate from progress on purpose: a note is not a measurement, and folding it into
 * `describeHabitProgress` made that function contradict its own contract.
 */
export const describeHabitNote = (habit: Habit): string | null => habit.noteKey;
