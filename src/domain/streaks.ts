import { toDayNumber } from './calendar';
import { DayRecordsByDate, IsoDate } from './types';

const ONE_DAY = 1;

const collectPerfectDayNumbers = (history: DayRecordsByDate): number[] =>
  Object.entries(history)
    .filter(([, record]) => record.perfectDay)
    .map(([date]) => toDayNumber(date))
    .filter((dayNumber): dayNumber is number => dayNumber !== null)
    .sort((first, second) => first - second);

/**
 * Consecutive perfect days ending today or yesterday.
 *
 * Yesterday counts because a day in progress is not yet a failure — at nine in the morning the
 * user has completed nothing, and showing a streak of zero would be both wrong and demoralising.
 * A day with no record at all is not perfect, so a gap breaks the run exactly like a bad day.
 */
export const calculateCurrentStreak = (history: DayRecordsByDate, today: IsoDate): number => {
  const todayNumber = toDayNumber(today);

  if (todayNumber === null) {
    return 0;
  }

  const perfectDays = new Set(collectPerfectDayNumbers(history));
  const endsToday = perfectDays.has(todayNumber);
  const startFrom = endsToday ? todayNumber : todayNumber - ONE_DAY;

  return countRunEndingAt(perfectDays, startFrom);
};

const countRunEndingAt = (perfectDays: ReadonlySet<number>, lastDay: number): number => {
  const run = { length: 0 };

  while (perfectDays.has(lastDay - run.length)) {
    run.length += ONE_DAY;
  }

  return run.length;
};

/** The longest run of consecutive perfect days anywhere in the challenge so far. */
export const calculateLongestStreak = (history: DayRecordsByDate): number => {
  const perfectDays = collectPerfectDayNumbers(history);

  if (perfectDays.length === 0) {
    return 0;
  }

  const best = { length: 1, current: 1 };

  perfectDays.forEach((dayNumber, index) => {
    if (index === 0) {
      return;
    }

    const previous = perfectDays[index - 1] ?? dayNumber;
    const isConsecutive = dayNumber - previous === ONE_DAY;

    best.current = isConsecutive ? best.current + ONE_DAY : 1;
    best.length = Math.max(best.length, best.current);
  });

  return best.length;
};
