import { Settings } from './types';

/** `HH:MM` on a 24-hour clock. Anything else is not a time this app can schedule against. */
const REMINDER_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

/** Reminders are set to the half hour. A minute-precise picker is precision nobody wants here. */
export const REMINDER_STEP_MINUTES = 30;

/**
 * What settings look like before the user has touched them.
 *
 * Notifications start off: asking for permission on first launch, before anyone has seen what the
 * app does, is how a permission prompt gets denied for good.
 */
export const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  notificationsEnabled: false,
  morningReminder: '07:00',
  eveningReminder: '20:00',
};

export const isReminderTime = (candidate: unknown): candidate is string =>
  typeof candidate === 'string' && REMINDER_TIME.test(candidate);

export const toMinutesOfDay = (time: string): number | null => {
  if (!isReminderTime(time)) {
    return null;
  }

  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3, 5));

  return hours * MINUTES_PER_HOUR + minutes;
};

export const formatMinutesOfDay = (minutesOfDay: number): string => {
  const hours = Math.floor(minutesOfDay / MINUTES_PER_HOUR);
  const minutes = minutesOfDay % MINUTES_PER_HOUR;

  return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
};

/**
 * Steps a reminder time, wrapping at midnight.
 *
 * Wrapping rather than clamping is deliberate: an evening reminder nudged past 23:30 should reach
 * the small hours, and a stepper that stops dead at either end reads as broken.
 */
export const shiftReminderTime = (time: string, deltaMinutes: number): string => {
  const current = toMinutesOfDay(time);

  if (current === null) {
    return time;
  }

  const shifted =
    (((current + deltaMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return formatMinutesOfDay(shifted);
};
