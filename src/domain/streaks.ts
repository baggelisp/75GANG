import { toDayNumber } from './calendar';
import { IsoDate } from './types';

const ONE_DAY = 1;

const toSortedDayNumbers = (dates: readonly IsoDate[]): number[] =>
  dates
    .map((date) => toDayNumber(date))
    .filter((dayNumber): dayNumber is number => dayNumber !== null)
    .sort((first, second) => first - second);

const countRunEndingAt = (perfectDays: ReadonlySet<number>, lastDay: number): number => {
  const run = { length: 0 };

  while (perfectDays.has(lastDay - run.length)) {
    run.length += ONE_DAY;
  }

  return run.length;
};

/**
 * Consecutive perfect days ending today or yesterday.
 *
 * Yesterday counts because a day in progress is not yet a failure — at nine in the morning the
 * user has completed nothing, and showing a streak of zero would be both wrong and demoralising.
 * A day with no record at all is not perfect, so a gap breaks the run exactly like a bad day.
 *
 * Takes the perfect dates rather than the day history, so what counts as perfect is decided once,
 * by the completion rules, and never read from a stored flag.
 */
export const calculateCurrentStreak = (
  perfectDates: readonly IsoDate[],
  today: IsoDate,
): number => {
  const todayNumber = toDayNumber(today);

  if (todayNumber === null) {
    return 0;
  }

  const perfectDays = new Set(toSortedDayNumbers(perfectDates));
  const endsToday = perfectDays.has(todayNumber);
  const startFrom = endsToday ? todayNumber : todayNumber - ONE_DAY;

  return countRunEndingAt(perfectDays, startFrom);
};

/** The longest run of consecutive perfect days anywhere in the challenge so far. */
export const calculateLongestStreak = (perfectDates: readonly IsoDate[]): number => {
  const perfectDays = toSortedDayNumbers(perfectDates);

  if (perfectDays.length === 0) {
    return 0;
  }

  const best = { length: 1, current: 1 };

  perfectDays.forEach((dayNumber, index) => {
    if (index === 0) {
      return;
    }

    const previous = perfectDays[index - 1];

    if (previous === undefined) {
      return;
    }

    best.current = dayNumber - previous === ONE_DAY ? best.current + ONE_DAY : 1;
    best.length = Math.max(best.length, best.current);
  });

  return best.length;
};
