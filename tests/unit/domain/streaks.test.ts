import { calculateCurrentStreak, calculateLongestStreak } from '@/domain/streaks';
import { DayRecordsByDate } from '@/domain/types';

const day = (perfectDay: boolean) => ({
  habits: {},
  completedHabits: perfectDay ? 11 : 6,
  totalHabits: 11,
  completionPercentage: perfectDay ? 100 : 55,
  perfectDay,
  updatedAt: '2026-09-07T21:00:00.000Z',
});

const buildHistory = (entries: Record<string, boolean>): DayRecordsByDate =>
  Object.fromEntries(Object.entries(entries).map(([date, perfect]) => [date, day(perfect)]));

const TODAY = '2026-09-07';

describe('calculateCurrentStreak', () => {
  it('is zero for an empty history', () => {
    expect(calculateCurrentStreak({}, TODAY)).toBe(0);
  });

  it('is one after a single perfect day', () => {
    expect(calculateCurrentStreak(buildHistory({ [TODAY]: true }), TODAY)).toBe(1);
  });

  it('counts consecutive perfect days back from today', () => {
    const history = buildHistory({
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(3);
  });

  it('breaks on a day that was recorded but not perfect', () => {
    const history = buildHistory({
      '2026-09-04': true,
      '2026-09-05': false,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(2);
  });

  it('breaks on a gap day with no record at all, which is not perfect', () => {
    const history = buildHistory({
      '2026-09-04': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(2);
  });

  it('survives today being unfinished, counting the run that ended yesterday', () => {
    const history = buildHistory({
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': false,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(2);
  });

  it('is zero when neither today nor yesterday was perfect', () => {
    const history = buildHistory({
      '2026-09-04': true,
      '2026-09-05': true,
      '2026-09-06': false,
      '2026-09-07': false,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(0);
  });

  it('ignores days recorded after today, which a clock change can produce', () => {
    const history = buildHistory({
      '2026-09-07': true,
      '2026-09-09': true,
    });

    expect(calculateCurrentStreak(history, TODAY)).toBe(1);
  });
});

describe('calculateLongestStreak', () => {
  it('is zero for an empty history', () => {
    expect(calculateLongestStreak({})).toBe(0);
  });

  it('finds the longest run when it is not the current one', () => {
    const history = buildHistory({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-03': true,
      '2026-09-04': true,
      '2026-09-05': false,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(history)).toBe(4);
  });

  it('treats a gap day as breaking the run', () => {
    const history = buildHistory({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-05': true,
      '2026-09-06': true,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(history)).toBe(3);
  });

  it('diverges from the current streak once the current one is broken', () => {
    const history = buildHistory({
      '2026-09-01': true,
      '2026-09-02': true,
      '2026-09-03': true,
      '2026-09-04': false,
      '2026-09-07': true,
    });

    expect(calculateLongestStreak(history)).toBe(3);
    expect(calculateCurrentStreak(history, TODAY)).toBe(1);
  });

  it('counts a month boundary as consecutive', () => {
    const history = buildHistory({
      '2026-09-29': true,
      '2026-09-30': true,
      '2026-10-01': true,
    });

    expect(calculateLongestStreak(history)).toBe(3);
  });
});
