import { HabitId, HabitIdEnum } from './habitIds';
import {
  CONNECTION_TARGET_MINUTES,
  READING_TARGET_PAGES,
  SKILL_TARGET_MINUTES,
  SPIRITUALITY_TARGET_MINUTES,
  TargetType,
  TargetTypeEnum,
  WATER_TARGET_LITRES,
  WORKOUT_SESSIONS_REQUIRED,
} from './targets';

export type Habit = {
  readonly id: HabitId;
  readonly number: number;
  readonly icon: string;
  readonly targetType: TargetType;
  readonly targetValue: number | null;
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
  },
  {
    id: HabitIdEnum.DIET,
    number: 2,
    icon: 'salad',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
  },
  {
    id: HabitIdEnum.WATER,
    number: 3,
    icon: 'droplet',
    targetType: TargetTypeEnum.LITRES,
    targetValue: WATER_TARGET_LITRES,
  },
  {
    id: HabitIdEnum.WORKOUTS,
    number: 4,
    icon: 'dumbbell',
    targetType: TargetTypeEnum.SESSIONS,
    targetValue: WORKOUT_SESSIONS_REQUIRED,
  },
  {
    id: HabitIdEnum.SKILL,
    number: 5,
    icon: 'brain',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SKILL_TARGET_MINUTES,
  },
  {
    id: HabitIdEnum.READING,
    number: 6,
    icon: 'book',
    targetType: TargetTypeEnum.PAGES,
    targetValue: READING_TARGET_PAGES,
  },
  {
    id: HabitIdEnum.MORNING_DETOX,
    number: 7,
    icon: 'phone-off',
    targetType: TargetTypeEnum.WINDOWS,
    targetValue: null,
  },
  {
    id: HabitIdEnum.NO_DEVICES_BED,
    number: 8,
    icon: 'bed',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
  },
  {
    id: HabitIdEnum.WEIGH_IN,
    number: 9,
    icon: 'scale',
    targetType: TargetTypeEnum.MEASUREMENT,
    targetValue: null,
  },
  {
    id: HabitIdEnum.SPIRITUALITY,
    number: 10,
    icon: 'sparkle',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SPIRITUALITY_TARGET_MINUTES,
  },
  {
    id: HabitIdEnum.CONNECTION,
    number: 11,
    icon: 'heart',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: CONNECTION_TARGET_MINUTES,
  },
];

export const findHabit = (habitId: HabitId): Habit | null =>
  HABITS.find((habit) => habit.id === habitId) ?? null;
