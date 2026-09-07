import { HabitId, HabitIdEnum } from './habitIds';
import {
  EASY_READING_TARGET_PAGES,
  EASY_SPIRITUALITY_TARGET_MINUTES,
  EASY_WATER_TARGET_LITRES,
  EASY_WORKOUT_MINUTES_REQUIRED,
  EASY_WORKOUT_SESSIONS_REQUIRED,
  MEDIUM_READING_TARGET_PAGES,
  MEDIUM_SKILL_TARGET_MINUTES,
  MEDIUM_WATER_TARGET_LITRES,
  MEDIUM_WORKOUT_SESSIONS_REQUIRED,
  WORKOUT_MINUTES_REQUIRED,
} from './targets';

export const ChallengeModeEnum = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type ChallengeMode = (typeof ChallengeModeEnum)[keyof typeof ChallengeModeEnum];

export const CHALLENGE_MODES: readonly ChallengeMode[] = [
  ChallengeModeEnum.EASY,
  ChallengeModeEnum.MEDIUM,
  ChallengeModeEnum.HARD,
];

/**
 * What a mode changes about a habit. A missing target keeps the habit's own default, which is the
 * value from `Docs/rules.jpeg`.
 */
export type HabitOverride = {
  readonly targetValue?: number;
  readonly sessionMinutes?: number;
};

export type ModeDefinition = {
  readonly mode: ChallengeMode;
  readonly habitIds: readonly HabitId[];
  readonly overrides: Readonly<Partial<Record<HabitId, HabitOverride>>>;
};

/**
 * The three challenges.
 *
 * Hard is `Docs/rules.jpeg` exactly and is never softened. Easy and Medium are strict subsets of
 * it: every habit in a lower mode also appears in a higher one, at a target that is equal or
 * harder. That is what makes moving up a real step rather than a different challenge.
 */
const EASY: ModeDefinition = {
  mode: ChallengeModeEnum.EASY,
  habitIds: [
    HabitIdEnum.NO_ALCOHOL,
    HabitIdEnum.WATER,
    HabitIdEnum.WORKOUTS,
    HabitIdEnum.READING,
    HabitIdEnum.NO_DEVICES_BED,
    HabitIdEnum.SPIRITUALITY,
  ],
  overrides: {
    [HabitIdEnum.WATER]: { targetValue: EASY_WATER_TARGET_LITRES },
    [HabitIdEnum.WORKOUTS]: {
      targetValue: EASY_WORKOUT_SESSIONS_REQUIRED,
      sessionMinutes: EASY_WORKOUT_MINUTES_REQUIRED,
    },
    [HabitIdEnum.READING]: { targetValue: EASY_READING_TARGET_PAGES },
    [HabitIdEnum.SPIRITUALITY]: { targetValue: EASY_SPIRITUALITY_TARGET_MINUTES },
  },
};

const MEDIUM: ModeDefinition = {
  mode: ChallengeModeEnum.MEDIUM,
  habitIds: [
    HabitIdEnum.NO_ALCOHOL,
    HabitIdEnum.DIET,
    HabitIdEnum.WATER,
    HabitIdEnum.WORKOUTS,
    HabitIdEnum.SKILL,
    HabitIdEnum.READING,
    HabitIdEnum.NO_DEVICES_BED,
    HabitIdEnum.SPIRITUALITY,
    HabitIdEnum.CONNECTION,
  ],
  overrides: {
    [HabitIdEnum.WATER]: { targetValue: MEDIUM_WATER_TARGET_LITRES },
    [HabitIdEnum.WORKOUTS]: {
      targetValue: MEDIUM_WORKOUT_SESSIONS_REQUIRED,
      sessionMinutes: WORKOUT_MINUTES_REQUIRED,
    },
    [HabitIdEnum.SKILL]: { targetValue: MEDIUM_SKILL_TARGET_MINUTES },
    [HabitIdEnum.READING]: { targetValue: MEDIUM_READING_TARGET_PAGES },
  },
};

const HARD: ModeDefinition = {
  mode: ChallengeModeEnum.HARD,
  habitIds: [
    HabitIdEnum.NO_ALCOHOL,
    HabitIdEnum.DIET,
    HabitIdEnum.WATER,
    HabitIdEnum.WORKOUTS,
    HabitIdEnum.SKILL,
    HabitIdEnum.READING,
    HabitIdEnum.MORNING_DETOX,
    HabitIdEnum.NO_DEVICES_BED,
    HabitIdEnum.WEIGH_IN,
    HabitIdEnum.SPIRITUALITY,
    HabitIdEnum.CONNECTION,
  ],
  overrides: {},
};

const DEFINITIONS: Readonly<Record<ChallengeMode, ModeDefinition>> = {
  [ChallengeModeEnum.EASY]: EASY,
  [ChallengeModeEnum.MEDIUM]: MEDIUM,
  [ChallengeModeEnum.HARD]: HARD,
};

export const findModeDefinition = (mode: ChallengeMode): ModeDefinition => DEFINITIONS[mode];

export const isChallengeMode = (candidate: unknown): candidate is ChallengeMode =>
  typeof candidate === 'string' && CHALLENGE_MODES.includes(candidate as ChallengeMode);
