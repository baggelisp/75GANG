import { Habit } from '@/domain/habits';
import { calculateHabitProgress } from '@/domain/progress';
import { TargetTypeEnum } from '@/domain/targets';
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
        phone: readNumber(current.phoneFreeMinutes),
        content: readNumber(current.noContentMinutes),
      },
    };
  }

  if (habit.targetType === TargetTypeEnum.MEASUREMENT) {
    const hasWeight = typeof current.weightKg === 'number';
    const hasPhoto = typeof current.photo === 'string' && current.photo.length > 0;

    if (hasWeight && hasPhoto) {
      return { key: 'today.progressWeighInDone', values: { weight: readNumber(current.weightKg) } };
    }

    return { key: 'today.progressWeighInPending', values: {} };
  }

  const progress = calculateHabitProgress(habit, current);

  return {
    key: `today.progress.${habit.targetType}`,
    values: { current: progress.current, target: progress.target },
  };
};
