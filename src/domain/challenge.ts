import { countDaysBetween } from './calendar';
import { ChallengeStatus, ChallengeStatusEnum, IsoDate } from './types';

export const CHALLENGE_LENGTH_DAYS = 75;
export const FIRST_CHALLENGE_DAY = 1;

/** Sentinels for a day number that is not a day of the challenge. */
export const ChallengeDayEnum = {
  NOT_STARTED: 0,
  UNKNOWN: -1,
} as const;

/**
 * Which day of the challenge a date is. The start date is day 1, and the answer is derived every
 * time — the current day is never stored, so it cannot drift.
 */
export const calculateCurrentDay = (startDate: IsoDate, today: IsoDate): number => {
  const elapsed = countDaysBetween(startDate, today);

  if (elapsed === null) {
    return ChallengeDayEnum.UNKNOWN;
  }

  if (elapsed < 0) {
    return ChallengeDayEnum.NOT_STARTED;
  }

  return elapsed + 1;
};

/** Whether a day number came back as a real day of the challenge rather than a sentinel. */
export const decideIsRealChallengeDay = (currentDay: number): boolean =>
  currentDay >= FIRST_CHALLENGE_DAY;

export const decideChallengeStatus = (currentDay: number): ChallengeStatus => {
  if (!decideIsRealChallengeDay(currentDay)) {
    return ChallengeStatusEnum.RESET;
  }

  if (currentDay > CHALLENGE_LENGTH_DAYS) {
    return ChallengeStatusEnum.COMPLETED;
  }

  return ChallengeStatusEnum.ACTIVE;
};

/**
 * Days left to run. A sentinel day is not a day of the challenge, so it reports the full length
 * rather than a number derived from -1 — which would read as "76 days remaining".
 */
export const calculateDaysRemaining = (currentDay: number): number => {
  if (!decideIsRealChallengeDay(currentDay)) {
    return CHALLENGE_LENGTH_DAYS;
  }

  const remaining = CHALLENGE_LENGTH_DAYS - currentDay;

  if (remaining < 0) {
    return 0;
  }

  return remaining;
};
