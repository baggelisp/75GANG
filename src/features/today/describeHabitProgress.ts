import { Habit } from '@/domain/habits';
import { decideIsMarkedDone } from '@/domain/markDone';
import { calculateHabitProgress, decideShownProgress } from '@/domain/progress';
import {
  NO_CONTENT_MINUTES_REQUIRED,
  PHONE_FREE_MINUTES_REQUIRED,
  TargetTypeEnum,
} from '@/domain/targets';
import { HabitRecord } from '@/domain/types';

export type HabitProgressDescription = {
  readonly key: string;
  readonly values: Record<string, string | number>;
};

const readNumber = (value: unknown): number => (typeof value === 'number' ? value : 0);

/**
 * The progress line under a rule, as a translation key and its values rather than a built string,
 * so the copy stays in the locale files.
 *
 * A simple tap has nothing to report: the checkbox already says everything.
 */
export const describeHabitProgress = (
  habit: Habit,
  record: HabitRecord | undefined,
): HabitProgressDescription | null => {
  const current = record ?? { completed: false };

  if (habit.targetType === TargetTypeEnum.BOOLEAN) {
    return null;
  }

  if (habit.targetType === TargetTypeEnum.SESSIONS) {
    const sessions = calculateHabitProgress(habit, current);

    return {
      key: 'today.progressSessions',
      values: { done: sessions.current, total: sessions.target },
    };
  }

  if (habit.targetType === TargetTypeEnum.WINDOWS) {
    return {
      key: 'today.progressWindows',
      values: {
        phone: decideShownProgress(
          current,
          readNumber(current.phoneFreeMinutes),
          PHONE_FREE_MINUTES_REQUIRED,
        ),
        content: decideShownProgress(
          current,
          readNumber(current.noContentMinutes),
          NO_CONTENT_MINUTES_REQUIRED,
        ),
      },
    };
  }

  if (habit.targetType === TargetTypeEnum.MEASUREMENT) {
    const hasWeight = typeof current.weightKg === 'number';
    const hasPhoto = typeof current.photo === 'string' && current.photo.length > 0;

    if (hasWeight && hasPhoto) {
      return { key: 'today.progressWeighInDone', values: { weight: readNumber(current.weightKg) } };
    }

    // Marked by hand with nothing recorded: there is no weight to quote, so the line says what
    // actually happened rather than inventing a measurement.
    if (decideIsMarkedDone(current)) {
      return { key: 'today.progressMarkedDone', values: {} };
    }

    return { key: 'today.progressWeighInPending', values: {} };
  }

  const progress = calculateHabitProgress(habit, current);

  return {
    key: `today.progress.${habit.targetType}`,
    values: { current: progress.current, target: progress.target },
  };
};
