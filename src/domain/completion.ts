import { findHabit } from './habits';
import { HabitId, TOTAL_HABITS } from './habitIds';
import {
  NO_CONTENT_MINUTES_REQUIRED,
  PHONE_FREE_MINUTES_REQUIRED,
  TargetType,
  TargetTypeEnum,
  WORKOUT_MINUTES_REQUIRED,
} from './targets';
import { DayCompletion, HabitRecord } from './types';

const PERCENTAGE_SCALE = 100;

type CompletionRule = (record: HabitRecord, targetValue: number | null) => boolean;

const decideTapIsComplete: CompletionRule = (record) => record.completed === true;

const decideCounterReachesTarget: CompletionRule = (record, targetValue) => {
  if (targetValue === null) {
    return false;
  }

  if (typeof record.value !== 'number') {
    return false;
  }

  return record.value >= targetValue;
};

const decideSessionsAreComplete: CompletionRule = (record, targetValue) => {
  if (targetValue === null) {
    return false;
  }

  if (record.sessions === undefined) {
    return false;
  }

  const longEnough = record.sessions.filter(
    (session) => session.minutes >= WORKOUT_MINUTES_REQUIRED,
  );

  return longEnough.length >= targetValue;
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
 * Whether one habit meets its own rule. Completion is always derived from the recorded value, so a
 * stale `completed` flag can never disagree with the numbers the user actually entered.
 */
export const decideHabitIsComplete = (habitId: string, record: HabitRecord): boolean => {
  const habit = findHabit(habitId as HabitId);

  if (habit === null) {
    return false;
  }

  return RULES_BY_TARGET_TYPE[habit.targetType](record, habit.targetValue);
};

export const calculateDayCompletion = (habits: Record<string, HabitRecord>): DayCompletion => {
  const completedHabits = Object.entries(habits).filter(([habitId, record]) =>
    decideHabitIsComplete(habitId, record),
  ).length;

  return {
    completedHabits,
    totalHabits: TOTAL_HABITS,
    completionPercentage: Math.round((completedHabits / TOTAL_HABITS) * PERCENTAGE_SCALE),
    perfectDay: completedHabits === TOTAL_HABITS,
  };
};
