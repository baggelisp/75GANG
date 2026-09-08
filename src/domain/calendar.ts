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
