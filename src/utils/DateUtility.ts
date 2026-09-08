import { countDaysFromCivil } from '@/domain/calendar';
import { IsoDate } from '@/domain/types';

const MILLISECONDS_PER_DAY = 86400000;
const ISO_DATE_LENGTH = 10;

/**
 * All date formatting and conversion. Never inline a toLocaleDateString in a component.
 *
 * A calendar day is taken from the device's local date, not from a UTC timestamp: at 01:00 in
 * Athens the UTC date is still yesterday, and recording a habit against yesterday would cost the
 * user a day of their challenge.
 */
export const toLocalIsoDate = (moment: Date): IsoDate => {
  const year = moment.getFullYear();
  const month = `${moment.getMonth() + 1}`.padStart(2, '0');
  const day = `${moment.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const addDays = (isoDate: IsoDate, days: number): IsoDate => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const shifted = new Date(
    (countDaysFromCivil(year ?? 0, month ?? 1, day ?? 1) + days) * MILLISECONDS_PER_DAY,
  );

  return shifted.toISOString().slice(0, ISO_DATE_LENGTH);
};

export const formatLongDate = (isoDate: IsoDate, locale: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const moment = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));

  return moment.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
};

export const startOfLocalDay = (isoDate: IsoDate): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
};

/**
 * The boundary a local calendar day ends at — midnight at the start of the next one.
 *
 * A timer or a detox window left running overnight is settled against this rather than against
 * the moment the app was next opened, so yesterday is worth what it actually ran for. It is the
 * exclusive boundary rather than 23:59:59.999, because an hour that ends exactly at midnight is a
 * full hour and must not bank as fifty-nine minutes.
 */
export const endOfLocalDay = (isoDate: IsoDate): Date =>
  new Date(startOfLocalDay(isoDate).getTime() + MILLISECONDS_PER_DAY);

/** Midday UTC, so a formatter's own timezone can never shift the date by a day. */
const toFormattableDate = (isoDate: IsoDate): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
};

/**
 * A date with its year — for anything that outlives the month it was written in.
 *
 * A challenge start shown as "Wed, Jul 29" is ambiguous the moment a user starts a second
 * challenge, or looks back at an imported backup from last year.
 */
export const formatLongDateWithYear = (isoDate: IsoDate, locale: string): string =>
  toFormattableDate(isoDate).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** The heading over a month in a calendar. */
export const formatMonthTitle = (isoDate: IsoDate, locale: string): string =>
  toFormattableDate(isoDate).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const formatDayOfMonth = (isoDate: IsoDate): string => `${Number(isoDate.slice(8, 10))}`;

/** 2024-01-01 was a Monday, so seven days from it are one of each, in calendar order. */
const A_MONDAY = Date.UTC(2024, 0, 1);
const DAYS_IN_A_WEEK = 7;

/**
 * The weekday column headings, Monday first, in the user's language.
 *
 * Taken from the formatter rather than written out in the locale files: a translator should not
 * have to keep seven abbreviations in step with the platform's own, and Greek initials are not
 * something the English file should be guessing at.
 */
export const listWeekdayInitials = (locale: string): readonly string[] =>
  Array.from({ length: DAYS_IN_A_WEEK }, (_unused, index) =>
    new Date(A_MONDAY + index * MILLISECONDS_PER_DAY).toLocaleDateString(locale, {
      weekday: 'narrow',
      timeZone: 'UTC',
    }),
  );
