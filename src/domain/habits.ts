import { HabitId, HabitIdEnum } from './habitIds';
import { ChallengeMode, findModeDefinition } from './modes';
import {
  CONNECTION_TARGET_MINUTES,
  READING_TARGET_PAGES,
  SKILL_TARGET_MINUTES,
  SPIRITUALITY_TARGET_MINUTES,
  TargetType,
  TargetTypeEnum,
  WATER_TARGET_LITRES,
  WORKOUT_MINUTES_REQUIRED,
  WORKOUT_SESSIONS_REQUIRED,
} from './targets';

export type Habit = {
  readonly id: HabitId;
  readonly number: number;
  readonly icon: string;
  readonly targetType: TargetType;
  readonly targetValue: number | null;
  /** For a sessions habit, how long each session must be. Null for every other target type. */
  readonly sessionMinutes: number | null;
};

/**
 * The eleven habits, in the order of `Docs/rules.jpeg`. Hardcoded, never stored: they are the
 * challenge, not user data.
 *
 * Names and descriptions are not here — they are user-facing strings and come from the translation
 * layer, keyed by habit id.
 */
export const HABITS: readonly Habit[] = [
  {
    id: HabitIdEnum.NO_ALCOHOL,
    number: 1,
    icon: 'ban',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.DIET,
    number: 2,
    icon: 'salad',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.WATER,
    number: 3,
    icon: 'droplet',
    targetType: TargetTypeEnum.LITRES,
    targetValue: WATER_TARGET_LITRES,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.WORKOUTS,
    number: 4,
    icon: 'dumbbell',
    targetType: TargetTypeEnum.SESSIONS,
    targetValue: WORKOUT_SESSIONS_REQUIRED,
    sessionMinutes: WORKOUT_MINUTES_REQUIRED,
  },
  {
    id: HabitIdEnum.SKILL,
    number: 5,
    icon: 'brain',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SKILL_TARGET_MINUTES,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.READING,
    number: 6,
    icon: 'book',
    targetType: TargetTypeEnum.PAGES,
    targetValue: READING_TARGET_PAGES,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.MORNING_DETOX,
    number: 7,
    icon: 'phone-off',
    targetType: TargetTypeEnum.WINDOWS,
    targetValue: null,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.NO_DEVICES_BED,
    number: 8,
    icon: 'bed',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.WEIGH_IN,
    number: 9,
    icon: 'scale',
    targetType: TargetTypeEnum.MEASUREMENT,
    targetValue: null,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.SPIRITUALITY,
    number: 10,
    icon: 'sparkle',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SPIRITUALITY_TARGET_MINUTES,
    sessionMinutes: null,
  },
  {
    id: HabitIdEnum.CONNECTION,
    number: 11,
    icon: 'heart',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: CONNECTION_TARGET_MINUTES,
    sessionMinutes: null,
  },
];

export const findHabit = (habitId: HabitId): Habit | null =>
  HABITS.find((habit) => habit.id === habitId) ?? null;

/**
 * The habits of one challenge, with that mode's targets applied.
 *
 * Hard returns the eleven rules exactly as `Docs/rules.jpeg` states them; Easy and Medium return
 * a subset at their own targets.
 */
export const resolveHabitsForMode = (mode: ChallengeMode): readonly Habit[] => {
  const definition = findModeDefinition(mode);

  return definition.habitIds.flatMap((habitId) => {
    const habit = findHabit(habitId);

    if (habit === null) {
      return [];
    }

    const override = definition.overrides[habitId];

    if (override === undefined) {
      return [habit];
    }

    return [
      {
        ...habit,
        targetValue: override.targetValue ?? habit.targetValue,
        sessionMinutes: override.sessionMinutes ?? habit.sessionMinutes,
      },
    ];
  });
};

export const findHabitForMode = (habitId: string, mode: ChallengeMode): Habit | null =>
  resolveHabitsForMode(mode).find((habit) => habit.id === habitId) ?? null;

/** Counted from the resolved habits, so a duplicated id could never make a perfect day unreachable. */
export const countHabitsForMode = (mode: ChallengeMode): number =>
  resolveHabitsForMode(mode).length;
