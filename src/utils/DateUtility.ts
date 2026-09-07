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

const ONE_DAY_IN_MILLISECONDS = 86400000;

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
  new Date(startOfLocalDay(isoDate).getTime() + ONE_DAY_IN_MILLISECONDS);
