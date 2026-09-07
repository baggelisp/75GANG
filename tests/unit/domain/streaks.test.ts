import { collectPerfectDates } from '@/domain/history';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { calculateCurrentStreak, calculateLongestStreak } from '@/domain/streaks';
import { DayRecordsByDate, HabitRecord } from '@/domain/types';

const TODAY = '2026-09-07';
const EASY = ChallengeModeEnum.EASY;

/** A genuinely perfect Easy day: six rules, each with the value that meets its target. */
const perfectEasyHabits = (): Record<string, HabitRecord> => ({
  [HabitIdEnum.NO_ALCOHOL]: { completed: true },
  [HabitIdEnum.NO_DEVICES_BED]: { completed: true },
  [HabitIdEnum.WATER]: { completed: false, value: 2 },
  [HabitIdEnum.WORKOUTS]: {
    completed: false,
    sessions: [{ minutes: 30, outdoor: true, completedAt: '2026-09-07T08:00:00.000Z' }],
  },
  [HabitIdEnum.READING]: { completed: false, value: 5 },
  [HabitIdEnum.SPIRITUALITY]: { completed: false, value: 10 },
});

const dayRecord = (isPerfect: boolean) => ({
  habits: isPerfect ? perfectEasyHabits() : { [HabitIdEnum.NO_ALCOHOL]: { completed: true } },
  completedHabits: isPerfect ? 6 : 1,
  totalHabits: 6,
  completionPercentage: isPerfect ? 100 : 17,
  perfectDay: isPerfect,
  updatedAt: '2026-09-07T21:00:00.000Z',
});

const buildHistory = (entries: Record<string, boolean>): DayRecordsByDate =>
  Object.fromEntries(Object.entries(entries).map(([date, perfect]) => [date, dayRecord(perfect)]));

const perfectDatesOf = (entries: Record<string, boolean>) =>
  collectPerfectDates(buildHistory(entries), EASY);

describe('collectPerfectDates', () => {
  it('recomputes perfection from the habits rather than trusting the stored flag', () => {
    const lying: DayRecordsByDate = {
      '2026-09-06': {
        habits: {},
        completedHabits: 6,
        totalHabits: 6,
        completionPercentage: 100,
        perfectDay: true,
        updatedAt: '2026-09-06T21:00:00.000Z',
      },
    };

    expect(collectPerfectDates(lying, EASY)).toEqual([]);
  });

  it('counts a day whose habits meet every target, whatever the flag says', () => {
    const understated: DayRecordsByDate = {
      '2026-09-06': { ...dayRecord(true), perfectDay: false },
    };

    expect(collectPerfectDates(understated, EASY)).toEqual(['2026-09-06']);
  });

  it('scores each day against the challenge being run', () => {
    const history = buildHistory({ '2026-09-06': true });

    expect(collectPerfectDates(history, EASY)).toEqual(['2026-09-06']);
    expect(collectPerfectDates(history, ChallengeModeEnum.HARD)).toEqual([]);
  });
});

describe('calculateCurrentStreak', () => {
  it('is zero for an empty history', () => {
    expect(calculateCurrentStreak([], TODAY)).toBe(0);
  });

  it('is one after a single perfect day', () => {
    expect(calculateCurrentStreak(perfectDatesOf({ [TODAY]: true }), TODAY)).toBe(1);
  });

  it('counts consecutive perfect days back from today', () => {
    const dates = perfectDatesOf({
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(3);
  });

  it('breaks on a day that was recorded but not perfect', () => {
    const dates = perfectDatesOf({
      '2026-09-04': true,
      '2026-09-05': false,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(2);
  });

  it('breaks on a gap day with no record at all, which is not perfect', () => {
    const dates = perfectDatesOf({
      '2026-09-04': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(2);
  });

  it('survives today being unfinished, counting the run that ended yesterday', () => {
    const dates = perfectDatesOf({
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': false,
    });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(2);
  });

  it('is zero when neither today nor yesterday was perfect', () => {
    const dates = perfectDatesOf({
      '2026-09-04': true,
      '2026-09-05': true,
      '2026-09-06': false,
      '2026-09-07': false,
    });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(0);
  });

  it('ignores days recorded after today, which a clock change can produce', () => {
    const dates = perfectDatesOf({ '2026-09-07': true, '2026-09-09': true });

    expect(calculateCurrentStreak(dates, TODAY)).toBe(1);
  });
});

describe('calculateLongestStreak', () => {
  it('is zero for an empty history', () => {
    expect(calculateLongestStreak([])).toBe(0);
  });

  it('finds the longest run when it is not the current one', () => {
    const dates = perfectDatesOf({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-03': true,
      '2026-09-04': true,
      '2026-09-05': false,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(dates)).toBe(4);
  });

  it('treats a gap day as breaking the run', () => {
    const dates = perfectDatesOf({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(dates)).toBe(3);
  });

  it('diverges from the current streak once the current one is broken', () => {
    const dates = perfectDatesOf({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-03': true,
      '2026-09-04': false,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(dates)).toBe(3);
    expect(calculateCurrentStreak(dates, TODAY)).toBe(1);
  });

  it('counts a month boundary as consecutive', () => {
    const dates = perfectDatesOf({
      '2026-09-29': true,
      '2026-09-30': true,
      '2026-10-01': true,
    });

    expect(calculateLongestStreak(dates)).toBe(3);
  });
});
