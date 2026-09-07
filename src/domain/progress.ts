import { Habit } from './habits';
import { TargetTypeEnum } from './targets';
import { HabitRecord } from './types';

export type HabitProgress = {
  readonly current: number;
  readonly target: number;
};

const readValue = (record: HabitRecord | undefined): number => {
  if (record === undefined || typeof record.value !== 'number') {
    return 0;
  }

  return record.value;
};

const countLongEnoughSessions = (
  record: HabitRecord | undefined,
  minutesRequired: number | null,
): number => {
  if (record === undefined || record.sessions === undefined || minutesRequired === null) {
    return 0;
  }

  return record.sessions.filter((session) => session.minutes >= minutesRequired).length;
};

/**
 * How far a habit has got towards its own target, in the units the habit is measured in.
 *
 * One place decides this. The rings, the legend and the progress line under a rule all read it, so
 * a ring can never disagree with the checkbox beside it — which is what happened when the screen
 * counted workout sessions with its own copy of the rule.
 */
export const calculateHabitProgress = (
  habit: Habit,
  record: HabitRecord | undefined,
): HabitProgress => {
  const target = habit.targetValue ?? 0;

  if (habit.targetType === TargetTypeEnum.SESSIONS) {
    return { current: countLongEnoughSessions(record, habit.sessionMinutes), target };
  }

  return { current: readValue(record), target };
};
