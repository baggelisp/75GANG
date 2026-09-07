import {
  CHALLENGE_LENGTH_DAYS,
  calculateCurrentDay,
  calculateDaysRemaining,
  ChallengeDayEnum,
  decideChallengeStatus,
} from '@/domain/challenge';
import { ChallengeStatusEnum } from '@/domain/types';

const START = '2026-09-07';

describe('calculateCurrentDay', () => {
  it('is day 1 on the start date, not day 0', () => {
    expect(calculateCurrentDay(START, START)).toBe(1);
  });

  it.each([
    ['the day after the start', '2026-09-08', 2],
    ['a week in', '2026-09-13', 7],
    ['the last day of the challenge', '2026-11-20', 75],
  ])('is day %s', (_description, today, expected) => {
    expect(calculateCurrentDay(START, today)).toBe(expected);
  });

  it('keeps counting past the end so the caller can tell the challenge is over', () => {
    expect(calculateCurrentDay(START, '2026-11-21')).toBe(76);
  });

  it('reports a start date in the future as not started', () => {
    expect(calculateCurrentDay('2026-09-10', '2026-09-07')).toBe(ChallengeDayEnum.NOT_STARTED);
  });

  it('counts across a month boundary', () => {
    expect(calculateCurrentDay('2026-09-30', '2026-10-01')).toBe(2);
  });

  it('counts across a year boundary', () => {
    expect(calculateCurrentDay('2026-12-31', '2027-01-01')).toBe(2);
  });

  it('counts a leap day as one day like any other', () => {
    expect(calculateCurrentDay('2028-02-28', '2028-03-01')).toBe(3);
  });

  it('is unaffected by a spring-forward transition, which is a 23 hour day', () => {
    expect(calculateCurrentDay('2027-03-27', '2027-03-29')).toBe(3);
  });

  it('is unaffected by an autumn transition, which is a 25 hour day', () => {
    expect(calculateCurrentDay('2027-10-30', '2027-11-01')).toBe(3);
  });

  it('rejects a date that is not a real calendar day', () => {
    expect(calculateCurrentDay(START, '2026-02-30')).toBe(ChallengeDayEnum.UNKNOWN);
  });
});

describe('decideChallengeStatus', () => {
  it.each([
    ['on day 1', 1, ChallengeStatusEnum.ACTIVE],
    ['on day 75', 75, ChallengeStatusEnum.ACTIVE],
    ['on day 76', 76, ChallengeStatusEnum.COMPLETED],
    ['well past the end', 400, ChallengeStatusEnum.COMPLETED],
  ])('is %s', (_description, currentDay, expected) => {
    expect(decideChallengeStatus(currentDay)).toBe(expected);
  });
});

describe('calculateDaysRemaining', () => {
  it.each([
    ['on day 1', 1, 74],
    ['on day 12', 12, 63],
    ['on the last day', 75, 0],
    ['past the end', 80, 0],
  ])('reports %s', (_description, currentDay, expected) => {
    expect(calculateDaysRemaining(currentDay)).toBe(expected);
  });
});

describe('the challenge length', () => {
  it('is 75 days', () => {
    expect(CHALLENGE_LENGTH_DAYS).toBe(75);
  });
});
