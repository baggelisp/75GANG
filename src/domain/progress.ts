import { Habit } from './habits';
import { decideIsMarkedDone } from './markDone';
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
 * What a readout should show.
 *
 * A rule the user marked done reads as its full target: a checked box beside "0.5 / 3 L" says two
 * opposite things at once, and marking done means the whole thing was done. A number already past
 * the target is left alone — nobody wants their 50 minutes rounded down to the 45 they owed.
 */
export const decideShownProgress = (
  record: HabitRecord | undefined,
  actual: number,
  target: number,
): number => {
  if (!decideIsMarkedDone(record)) {
    return actual;
  }

  return Math.max(actual, target);
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
    const done = countLongEnoughSessions(record, habit.sessionMinutes);

    return { current: decideShownProgress(record, done, target), target };
  }

  return { current: decideShownProgress(record, readValue(record), target), target };
};
