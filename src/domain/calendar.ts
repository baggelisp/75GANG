import { IsoDate } from './types';
import { isIsoDate } from './validation';

const DAYS_PER_ERA = 146097;
const DAYS_PER_YEAR = 365;
const ERA_YEARS = 400;
const CIVIL_EPOCH_SHIFT = 719468;
const MARCH = 3;

/**
 * Days since 1970-01-01 for a calendar date, by Howard Hinnant's `days_from_civil`.
 *
 * Calendar arithmetic rather than `Date` subtraction, for two reasons: the domain may not
 * construct a Date, and a day is not always 24 hours. Subtracting timestamps across a
 * daylight-saving transition gives 23 or 25 hours and rounds to the wrong day — which would move
 * the user's challenge day by one, twice a year.
 */
export const countDaysFromCivil = (year: number, month: number, day: number): number => {
  const shiftedYear = month <= MARCH - 1 ? year - 1 : year;
  const era = Math.floor(shiftedYear / ERA_YEARS);
  const yearOfEra = shiftedYear - era * ERA_YEARS;
  const shiftedMonth = month + (month > MARCH - 1 ? -MARCH : 9);
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * DAYS_PER_YEAR + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;

  return era * DAYS_PER_ERA + dayOfEra - CIVIL_EPOCH_SHIFT;
};

export const toDayNumber = (isoDate: string): number | null => {
  if (!isIsoDate(isoDate)) {
    return null;
  }

  return countDaysFromCivil(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)),
    Number(isoDate.slice(8, 10)),
  );
};

/** Whole calendar days between two dates, ignoring clocks entirely. */
export const countDaysBetween = (fromIsoDate: string, toIsoDate: string): number | null => {
  const from = toDayNumber(fromIsoDate);
  const to = toDayNumber(toIsoDate);

  if (from === null || to === null) {
    return null;
  }

  return to - from;
};

const DAYS_PER_FOUR_YEARS = 1460;
const DAYS_PER_CENTURY = 36524;
const MARCH_OFFSET = 2;
const FIVE_MONTH_CYCLE = 153;

/**
 * The inverse of `countDaysFromCivil`, by Howard Hinnant's `civil_from_days`.
 *
 * Arithmetic rather than `new Date(...)`, because the domain never constructs one — and because
 * adding days to a date through a Date object goes wrong across a daylight-saving boundary in
 * exactly the way this whole module exists to avoid.
 */
export const fromDayNumber = (dayNumber: number): IsoDate => {
  const shifted = dayNumber + CIVIL_EPOCH_SHIFT;
  const era = Math.floor(shifted / DAYS_PER_ERA);
  const dayOfEra = shifted - era * DAYS_PER_ERA;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / DAYS_PER_FOUR_YEARS) +
      Math.floor(dayOfEra / DAYS_PER_CENTURY) -
      Math.floor(dayOfEra / (DAYS_PER_ERA - 1))) /
      DAYS_PER_YEAR,
  );
  const year = yearOfEra + era * ERA_YEARS;
  const dayOfYear =
    dayOfEra -
    (DAYS_PER_YEAR * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPortion = Math.floor((5 * dayOfYear + MARCH_OFFSET) / FIVE_MONTH_CYCLE);
  const day = dayOfYear - Math.floor((FIVE_MONTH_CYCLE * monthPortion + MARCH_OFFSET) / 5) + 1;
  const month = monthPortion < 10 ? monthPortion + MARCH : monthPortion - 9;
  const calendarYear = month <= MARCH - 1 ? year + 1 : year;

  return `${pad(calendarYear, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
};

const pad = (value: number, width: number): string => `${value}`.padStart(width, '0');

/** Adds days to a calendar date, purely. */
export const addCalendarDays = (isoDate: IsoDate, days: number): IsoDate | null => {
  const dayNumber = toDayNumber(isoDate);

  if (dayNumber === null) {
    return null;
  }

  return fromDayNumber(dayNumber + days);
};
