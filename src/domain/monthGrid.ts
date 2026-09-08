import { toDayNumber } from './calendar';
import { IsoDate } from './types';
import { isIsoDate } from './validation';

export const DAYS_PER_WEEK = 7;

/** 1970-01-01 was a Thursday, which is index 3 when the week starts on Monday. */
const EPOCH_WEEKDAY_INDEX = 3;

/**
 * Which column a date belongs in, counting from Monday.
 *
 * Monday-first because the challenge is a discipline routine and every European calendar the
 * users read starts there. Derived from the day number rather than from a `Date`, so the domain
 * stays pure and the answer cannot shift with a daylight-saving boundary.
 */
export const decideWeekdayIndex = (isoDate: string): number | null => {
  const dayNumber = toDayNumber(isoDate);

  if (dayNumber === null) {
    return null;
  }

  return (((dayNumber + EPOCH_WEEKDAY_INDEX) % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
};

/** `YYYY-MM`, the key a month is grouped under. */
export const readMonthKey = (isoDate: string): string | null => {
  if (!isIsoDate(isoDate)) {
    return null;
  }

  return isoDate.slice(0, 7);
};

export type DatedItem = { readonly date: IsoDate };

/** A slot in a week row. `null` is a day the calendar has nothing for. */
export type CalendarSlot<TDay> = TDay | null;

export type CalendarMonth<TDay> = {
  readonly key: string;
  readonly year: number;
  readonly month: number;
  readonly weeks: readonly (readonly CalendarSlot<TDay>[])[];
};

/**
 * Lays dated items out as real calendar months: Monday-first weeks, each day under its weekday.
 *
 * The alternative — a flat run of cells, fifteen to a row — reads as a progress bar rather than a
 * calendar, and gives the user no way to connect a cell to a day they remember. Weekday columns
 * are what make "I always miss Sundays" visible.
 *
 * Missing days become gaps rather than being skipped, because closing the gap would slide every
 * later day into the wrong weekday column and quietly lie about the whole month.
 */
export const buildCalendarMonths = <TDay extends DatedItem>(
  days: readonly TDay[],
): readonly CalendarMonth<TDay>[] => {
  const usable = days.filter((day) => isIsoDate(day.date));
  const keys = collectMonthKeysInOrder(usable);

  return keys.map((key) =>
    buildMonth(
      key,
      usable.filter((day) => day.date.startsWith(key)),
    ),
  );
};

const collectMonthKeysInOrder = (days: readonly DatedItem[]): readonly string[] => {
  const seen = new Set<string>();

  days.forEach((day) => {
    const key = readMonthKey(day.date);

    if (key !== null) {
      seen.add(key);
    }
  });

  return Array.from(seen).sort();
};

const buildMonth = <TDay extends DatedItem>(
  key: string,
  days: readonly TDay[],
): CalendarMonth<TDay> => {
  const positions = days.map((day) => ({ day, position: readPosition(day.date) }));
  const lastPosition = positions.reduce((furthest, one) => Math.max(furthest, one.position), 0);
  const weekCount = Math.floor(lastPosition / DAYS_PER_WEEK) + 1;

  const weeks = Array.from({ length: weekCount }, (_unused, weekIndex) =>
    Array.from({ length: DAYS_PER_WEEK }, (_slot, dayIndex) => {
      const position = weekIndex * DAYS_PER_WEEK + dayIndex;

      return positions.find((one) => one.position === position)?.day ?? null;
    }),
  );

  return {
    key,
    year: Number(key.slice(0, 4)),
    month: Number(key.slice(5, 7)),
    weeks,
  };
};

/** Where a date sits in its month's grid: the day of the month, offset by the first weekday. */
const readPosition = (isoDate: IsoDate): number => {
  const dayOfMonth = Number(isoDate.slice(8, 10));
  const firstOfMonth = `${isoDate.slice(0, 7)}-01`;

  return (decideWeekdayIndex(firstOfMonth) ?? 0) + dayOfMonth - 1;
};

const MONTHS_PER_YEAR = 12;

/** Every day of a month, in order — what a date picker draws even where nothing may be chosen. */
export const listMonthDays = (monthKey: string): readonly IsoDate[] => {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));

  if (!Number.isInteger(year) || month < 1 || month > MONTHS_PER_YEAR) {
    return [];
  }

  return Array.from({ length: countDaysInMonth(year, month) }, (_unused, index) =>
    buildDate(year, month, index + 1),
  );
};

/** Steps a month key, rolling into the next or previous year. */
export const addCalendarMonths = (monthKey: string, months: number): string => {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));

  if (!Number.isInteger(year) || month < 1 || month > MONTHS_PER_YEAR) {
    return monthKey;
  }

  const total = year * MONTHS_PER_YEAR + (month - 1) + months;

  return `${pad(Math.floor(total / MONTHS_PER_YEAR), 4)}-${pad((total % MONTHS_PER_YEAR) + 1, 2)}`;
};

const countDaysInMonth = (year: number, month: number): number => {
  const first = toDayNumber(buildDate(year, month, 1)) ?? 0;
  const nextMonth = addCalendarMonths(`${pad(year, 4)}-${pad(month, 2)}`, 1);
  const next = toDayNumber(`${nextMonth}-01`) ?? 0;

  return next - first;
};

const buildDate = (year: number, month: number, day: number): IsoDate =>
  `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;

const pad = (value: number, width: number): string => `${value}`.padStart(width, '0');
