import { HabitRecord, IsoTimestamp } from './types';

const MILLISECONDS_PER_MINUTE = 60000;

/**
 * Minutes elapsed since a timer was started.
 *
 * Takes `now` as an argument, because the whole point of storing a start timestamp rather than a
 * tick counter is that a timer keeps elapsing while the app is closed — and that is only testable
 * if the clock is a parameter.
 *
 * A start in the future contributes nothing rather than a negative amount: a clock that moved
 * backwards must not take minutes away from the user.
 */
export const calculateElapsedMinutes = (
  startedAt: IsoTimestamp | null | undefined,
  now: Date,
): number => {
  if (startedAt === null || startedAt === undefined) {
    return 0;
  }

  const started = Date.parse(startedAt);

  if (Number.isNaN(started)) {
    return 0;
  }

  const elapsed = (now.getTime() - started) / MILLISECONDS_PER_MINUTE;

  if (elapsed <= 0) {
    return 0;
  }

  return elapsed;
};

export const decideTimerIsRunning = (record: HabitRecord | undefined): boolean =>
  record?.startedAt !== null && record?.startedAt !== undefined;

const readAccumulated = (record: HabitRecord | undefined): number => {
  if (record === undefined || typeof record.value !== 'number') {
    return 0;
  }

  return record.value;
};

/** Minutes banked plus whatever the running timer has added since it was started. */
export const calculateTimerMinutes = (record: HabitRecord | undefined, now: Date): number =>
  readAccumulated(record) + calculateElapsedMinutes(record?.startedAt, now);

export const startTimer = (record: HabitRecord | undefined, now: Date): HabitRecord => ({
  ...(record ?? { completed: false }),
  value: readAccumulated(record),
  startedAt: now.toISOString(),
});

/** Banks what the timer has run and stops it. */
export const pauseTimer = (record: HabitRecord | undefined, now: Date): HabitRecord => ({
  ...(record ?? { completed: false }),
  value: calculateTimerMinutes(record, now),
  startedAt: null,
});

/**
 * Banks what a still-running timer has earned and moves its baseline to now.
 *
 * Called when a day is read, so a timer left running while the app was closed is worth what it
 * actually ran for. It is not a tick: nothing is written between one read and the next, and the
 * timer keeps running afterwards.
 */
export const foldRunningTimer = (record: HabitRecord | undefined, now: Date): HabitRecord => {
  if (!decideTimerIsRunning(record)) {
    return record ?? { completed: false };
  }

  return {
    ...(record ?? { completed: false }),
    value: calculateTimerMinutes(record, now),
    startedAt: now.toISOString(),
  };
};
