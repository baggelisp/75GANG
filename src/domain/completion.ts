import { countHabitsForMode, findHabitForMode, Habit } from './habits';
import { ChallengeMode } from './modes';
import {
  NO_CONTENT_MINUTES_REQUIRED,
  PHONE_FREE_MINUTES_REQUIRED,
  TargetType,
  TargetTypeEnum,
} from './targets';
import { DayCompletion, HabitRecord } from './types';

const PERCENTAGE_SCALE = 100;

type CompletionRule = (record: HabitRecord, habit: Habit) => boolean;

const decideTapIsComplete: CompletionRule = (record) => record.completed === true;

const decideCounterReachesTarget: CompletionRule = (record, habit) => {
  if (habit.targetValue === null) {
    return false;
  }

  if (typeof record.value !== 'number') {
    return false;
  }

  return record.value >= habit.targetValue;
};

const decideSessionsAreComplete: CompletionRule = (record, habit) => {
  const sessionsRequired = habit.targetValue;
  const minutesRequired = habit.sessionMinutes;

  if (sessionsRequired === null || minutesRequired === null) {
    return false;
  }

  if (record.sessions === undefined) {
    return false;
  }

  const longEnough = record.sessions.filter((session) => session.minutes >= minutesRequired);

  return longEnough.length >= sessionsRequired;
};

const decideWindowsAreComplete: CompletionRule = (record) => {
  if (record.phoneFreeMinutes === undefined || record.noContentMinutes === undefined) {
    return false;
  }

  return (
    record.phoneFreeMinutes >= PHONE_FREE_MINUTES_REQUIRED &&
    record.noContentMinutes >= NO_CONTENT_MINUTES_REQUIRED
  );
};

const decideMeasurementIsComplete: CompletionRule = (record) => {
  const hasWeight = typeof record.weightKg === 'number';
  const hasPhoto = typeof record.photo === 'string' && record.photo.length > 0;

  return hasWeight && hasPhoto;
};

/**
 * One rule per target type. Adding a tracker is a new entry here, never a new
 * `if (habitId === 'water')` branch.
 */
const RULES_BY_TARGET_TYPE: Readonly<Record<TargetType, CompletionRule>> = {
  [TargetTypeEnum.BOOLEAN]: decideTapIsComplete,
  [TargetTypeEnum.LITRES]: decideCounterReachesTarget,
  [TargetTypeEnum.PAGES]: decideCounterReachesTarget,
  [TargetTypeEnum.MINUTES]: decideCounterReachesTarget,
  [TargetTypeEnum.SESSIONS]: decideSessionsAreComplete,
  [TargetTypeEnum.WINDOWS]: decideWindowsAreComplete,
  [TargetTypeEnum.MEASUREMENT]: decideMeasurementIsComplete,
};

/**
 * Whether one habit meets its own rule in this challenge.
 *
 * The mode decides the target, so 2 litres completes water on Easy and does not on Hard.
 * Completion is always derived from the recorded value, so a stale `completed` flag can never
 * disagree with the numbers the user actually entered.
 */
export const decideHabitIsComplete = (
  habitId: string,
  record: HabitRecord,
  mode: ChallengeMode,
): boolean => {
  const habit = findHabitForMode(habitId, mode);

  if (habit === null) {
    return false;
  }

  return RULES_BY_TARGET_TYPE[habit.targetType](record, habit);
};

/**
 * A day's score in this challenge. Habits that belong to a harder mode are ignored, so a record
 * carried over from a reset never inflates an Easy day.
 */
export const calculateDayCompletion = (
  habits: Record<string, HabitRecord>,
  mode: ChallengeMode,
): DayCompletion => {
  const totalHabits = countHabitsForMode(mode);
  const completedHabits = Object.entries(habits).filter(([habitId, record]) =>
    decideHabitIsComplete(habitId, record, mode),
  ).length;

  return {
    completedHabits,
    totalHabits,
    completionPercentage: Math.round((completedHabits / totalHabits) * PERCENTAGE_SCALE),
    perfectDay: completedHabits === totalHabits,
  };
};
