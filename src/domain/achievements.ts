import { CHALLENGE_LENGTH_DAYS, decideIsRealChallengeDay } from './challenge';

export const BadgeIdEnum = {
  SEVEN_DAY_WARRIOR: 'seven-day-warrior',
  PERFECT_WEEK: 'perfect-week',
  THIRTY_DAY_DISCIPLINE: 'thirty-day-discipline',
  HALFWAY_THERE: 'halfway-there',
  SEVENTY_FIVE_COMPLETE: 'seventy-five-complete',
} as const;

export type BadgeId = (typeof BadgeIdEnum)[keyof typeof BadgeIdEnum];

/** What the numbers must reach. Which number matters is what separates one badge from another. */
export const BadgeMeasureEnum = {
  /** Consecutive perfect days. */
  LONGEST_STREAK: 'LONGEST_STREAK',
  /** Perfect days anywhere in the challenge, consecutive or not. */
  PERFECT_DAYS: 'PERFECT_DAYS',
  /** The day of the challenge reached, whether or not those days went well. */
  CURRENT_DAY: 'CURRENT_DAY',
} as const;

export type BadgeMeasure = (typeof BadgeMeasureEnum)[keyof typeof BadgeMeasureEnum];

export type BadgeDefinition = {
  readonly id: BadgeId;
  readonly measure: BadgeMeasure;
  readonly threshold: number;
};

export const PERFECT_WEEK_DAYS = 7;
export const HALFWAY_DAY = 38;
export const THIRTY_DAY_MARK = 30;

/**
 * The five MVP badges, from `Docs/75-hard-gang-way-mvp.md` — "MVP Badges".
 *
 * The wording there is precise and the difference matters: "complete 7 consecutive days" is a
 * streak, "all 11 habits for 7 days" is a count of perfect days however they fell, and "reach day
 * 30" asks nothing of how those days went.
 */
export const BADGES: readonly BadgeDefinition[] = [
  {
    id: BadgeIdEnum.SEVEN_DAY_WARRIOR,
    measure: BadgeMeasureEnum.LONGEST_STREAK,
    threshold: PERFECT_WEEK_DAYS,
  },
  {
    id: BadgeIdEnum.PERFECT_WEEK,
    measure: BadgeMeasureEnum.PERFECT_DAYS,
    threshold: PERFECT_WEEK_DAYS,
  },
  {
    id: BadgeIdEnum.THIRTY_DAY_DISCIPLINE,
    measure: BadgeMeasureEnum.CURRENT_DAY,
    threshold: THIRTY_DAY_MARK,
  },
  {
    id: BadgeIdEnum.HALFWAY_THERE,
    measure: BadgeMeasureEnum.CURRENT_DAY,
    threshold: HALFWAY_DAY,
  },
  {
    id: BadgeIdEnum.SEVENTY_FIVE_COMPLETE,
    measure: BadgeMeasureEnum.LONGEST_STREAK,
    threshold: CHALLENGE_LENGTH_DAYS,
  },
];

export type AchievementInput = {
  currentDay: number;
  perfectDays: number;
  longestStreak: number;
};

export type Achievement = {
  id: BadgeId;
  measure: BadgeMeasure;
  threshold: number;
  reached: number;
  isEarned: boolean;
};

/**
 * Every badge, earned or not, recomputed from the day records.
 *
 * Nothing is stored: a badge is a statement about the history, and a stored one would survive a
 * reset and claim a challenge the user never finished. Unearned badges are returned too, so the
 * screen can show what is still to come rather than an empty space.
 */
export const collectAchievements = (input: AchievementInput): readonly Achievement[] =>
  BADGES.map((badge) => {
    const reached = readMeasure(badge.measure, input);

    return {
      id: badge.id,
      measure: badge.measure,
      threshold: badge.threshold,
      reached,
      isEarned: reached >= badge.threshold,
    };
  });

export const findAchievement = (
  achievements: readonly Achievement[],
  id: string,
): Achievement | null => achievements.find((achievement) => achievement.id === id) ?? null;

const readMeasure = (measure: BadgeMeasure, input: AchievementInput): number => {
  if (measure === BadgeMeasureEnum.LONGEST_STREAK) {
    return input.longestStreak;
  }

  if (measure === BadgeMeasureEnum.PERFECT_DAYS) {
    return input.perfectDays;
  }

  // A sentinel day number is not a day of the challenge, and reading it as a count would earn
  // "Reach day 30" the moment a challenge could not be read.
  return decideIsRealChallengeDay(input.currentDay) ? input.currentDay : 0;
};
