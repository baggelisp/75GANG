import { calculateElapsedMinutes } from './timers';
import { NO_CONTENT_MINUTES_REQUIRED, PHONE_FREE_MINUTES_REQUIRED } from './targets';
import { HabitRecord } from './types';

export type DetoxWindow = {
  readonly elapsedMinutes: number;
  readonly requiredMinutes: number;
  readonly isDone: boolean;
};

export type DetoxProgress = {
  readonly hasWokenUp: boolean;
  readonly phone: DetoxWindow;
  readonly content: DetoxWindow;
};

const buildWindow = (elapsedMinutes: number, requiredMinutes: number): DetoxWindow => ({
  elapsedMinutes,
  requiredMinutes,
  isDone: elapsedMinutes >= requiredMinutes,
});

export const decideHasWokenUp = (record: HabitRecord | undefined): boolean =>
  record?.wokeUpAt !== null && record?.wokeUpAt !== undefined;

/**
 * Both windows of rule 7, measured from the one moment the user woke up.
 *
 * They run in parallel from a single timestamp rather than as two timers, because that is what the
 * rule describes: one hour with no phone and three hours with no content, both starting when you
 * open your eyes.
 */
export const calculateDetoxProgress = (
  record: HabitRecord | undefined,
  now: Date,
): DetoxProgress => {
  const elapsed = calculateElapsedMinutes(record?.wokeUpAt, now);

  return {
    hasWokenUp: decideHasWokenUp(record),
    phone: buildWindow(elapsed, PHONE_FREE_MINUTES_REQUIRED),
    content: buildWindow(elapsed, NO_CONTENT_MINUTES_REQUIRED),
  };
};

/**
 * Records waking up, and banks whatever the windows are worth at that moment.
 *
 * Pressing it again does not restart a morning that is already under way: a second tap would
 * otherwise throw away an hour of a phone-free window the user had genuinely earned.
 */
export const recordWakeUp = (record: HabitRecord | undefined, now: Date): HabitRecord => {
  if (decideHasWokenUp(record)) {
    return record ?? { completed: false };
  }

  return {
    ...(record ?? { completed: false }),
    wokeUpAt: now.toISOString(),
    phoneFreeMinutes: 0,
    noContentMinutes: 0,
  };
};

/**
 * Banks both windows against the clock.
 *
 * Completion reads the stored minutes, so they have to be written down for the day to count —
 * this is what credits a window that finished while the app was closed.
 */
export const settleDetox = (record: HabitRecord | undefined, now: Date): HabitRecord => {
  if (!decideHasWokenUp(record)) {
    return record ?? { completed: false };
  }

  const progress = calculateDetoxProgress(record, now);

  return {
    ...(record ?? { completed: false }),
    phoneFreeMinutes: bankMinutes(progress.phone.elapsedMinutes, PHONE_FREE_MINUTES_REQUIRED),
    noContentMinutes: bankMinutes(progress.content.elapsedMinutes, NO_CONTENT_MINUTES_REQUIRED),
  };
};

/**
 * Whole minutes, never more than the window is worth.
 *
 * Rounded because the stored number is shown to the user and written into an export, and
 * `41.766666666666666 min` is not something anyone should read on a habit tracker.
 */
const bankMinutes = (elapsed: number, required: number): number =>
  Math.min(Math.round(elapsed), required);

/** Undoes a mis-tap, so a morning recorded by accident is recoverable. */
export const clearWakeUp = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  wokeUpAt: null,
  phoneFreeMinutes: 0,
  noContentMinutes: 0,
});

/**
 * Whether settling this record against `asOf` would actually change it.
 *
 * Asked this way rather than "are the windows full", because a day that can never fill — an
 * evening wake-up, or a past day already settled against its own end — would otherwise be
 * rewritten on every read for the rest of the challenge, restamping a historical record's
 * `updatedAt` with today's date every time the app was opened.
 */
export const decideDetoxIsUnsettled = (record: HabitRecord | undefined, asOf: Date): boolean => {
  if (!decideHasWokenUp(record)) {
    return false;
  }

  const settled = settleDetox(record, asOf);

  return (
    settled.phoneFreeMinutes !== record?.phoneFreeMinutes ||
    settled.noContentMinutes !== record?.noContentMinutes
  );
};
