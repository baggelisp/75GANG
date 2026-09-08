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
  /**
   * Translation key for a standing reminder shown under the rule, for habits whose rule carries a
   * condition the checkbox cannot express — the diet cut-off, for instance. Null for the rest.
   */
  readonly noteKey: string | null;
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
    noteKey: null,
  },
  {
    id: HabitIdEnum.DIET,
    number: 2,
    icon: 'salad',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
    sessionMinutes: null,
    noteKey: 'habits.diet.note',
  },
  {
    id: HabitIdEnum.WATER,
    number: 3,
    icon: 'droplet',
    targetType: TargetTypeEnum.LITRES,
    targetValue: WATER_TARGET_LITRES,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.WORKOUTS,
    number: 4,
    icon: 'dumbbell',
    targetType: TargetTypeEnum.SESSIONS,
    targetValue: WORKOUT_SESSIONS_REQUIRED,
    sessionMinutes: WORKOUT_MINUTES_REQUIRED,
    noteKey: null,
  },
  {
    id: HabitIdEnum.SKILL,
    number: 5,
    icon: 'brain',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SKILL_TARGET_MINUTES,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.READING,
    number: 6,
    icon: 'book',
    targetType: TargetTypeEnum.PAGES,
    targetValue: READING_TARGET_PAGES,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.MORNING_DETOX,
    number: 7,
    icon: 'phone-off',
    targetType: TargetTypeEnum.WINDOWS,
    targetValue: null,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.NO_DEVICES_BED,
    number: 8,
    icon: 'bed',
    targetType: TargetTypeEnum.BOOLEAN,
    targetValue: null,
    sessionMinutes: null,
    noteKey: 'habits.no-devices-bed.note',
  },
  {
    id: HabitIdEnum.WEIGH_IN,
    number: 9,
    icon: 'scale',
    targetType: TargetTypeEnum.MEASUREMENT,
    targetValue: null,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.SPIRITUALITY,
    number: 10,
    icon: 'sparkle',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: SPIRITUALITY_TARGET_MINUTES,
    sessionMinutes: null,
    noteKey: null,
  },
  {
    id: HabitIdEnum.CONNECTION,
    number: 11,
    icon: 'heart',
    targetType: TargetTypeEnum.MINUTES,
    targetValue: CONNECTION_TARGET_MINUTES,
    sessionMinutes: null,
    noteKey: null,
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

/**
 * The numbers a habit's own copy interpolates.
 *
 * The rules are the same eleven in every challenge but the targets are not, so the name has to
 * carry the target rather than being written out with Hard's numbers baked in. Easy showed "Drink
 * 3 litres of water" above a progress line reading "0 / 2 L" — two different rules on one row.
 */
export const describeHabitTargets = (habit: Habit): Record<string, number> => ({
  // Zero for a habit with no numeric target, which is safe here and only here: those habits' copy
  // carries no placeholder, so the value is never read. Nothing else may coerce an absence to 0.
  target: habit.targetValue ?? 0,
  minutes: habit.sessionMinutes ?? 0,
});

/** A target of one. "1 workouts" is wrong, and the translation layer has no plural rules. */
const SINGULAR_TARGET = 1;

/**
 * Which copy key a habit's name comes from.
 *
 * Keyed on the number rather than on the habit id: Easy and Medium drop the workouts to a single
 * session, and any future mode that drops another habit to one gets the right words for free.
 * `tests/unit/i18n/habitNames.test.ts` pins that every habit which can reach one has the key.
 */
export const decideHabitNameKey = (habit: Habit): string => {
  if (habit.targetValue === SINGULAR_TARGET) {
    return `habits.${habit.id}.nameSingle`;
  }

  return `habits.${habit.id}.name`;
};
