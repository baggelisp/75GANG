import { calculateElapsedMinutes, decideTimerIsRunning } from './timers';
import { HabitRecord, IsoTimestamp, WorkoutSession } from './types';

const readSessions = (record: HabitRecord | undefined): readonly WorkoutSession[] =>
  record?.sessions ?? [];

export const startWorkout = (
  record: HabitRecord | undefined,
  now: Date,
  isOutdoor: boolean,
): HabitRecord => ({
  ...(record ?? { completed: false }),
  startedAt: now.toISOString(),
  outdoor: isOutdoor,
});

/**
 * Ends the workout being timed and records it as one session.
 *
 * A session is recorded whatever its length, and the rule decides separately whether it was long
 * enough — so a twenty minute workout is visible to the user rather than silently discarded.
 *
 * Crucially it is recorded as **one** session however long it ran: ninety minutes in one go is one
 * workout, not two, which is what rule 4 actually says.
 */
export const finishWorkout = (record: HabitRecord | undefined, now: Date): HabitRecord => {
  if (!decideTimerIsRunning(record)) {
    return record ?? { completed: false };
  }

  const minutes = calculateElapsedMinutes(record?.startedAt, now);

  return {
    ...(record ?? { completed: false }),
    startedAt: null,
    outdoor: false,
    sessions: [...readSessions(record), buildSession(minutes, record?.outdoor ?? false, now)],
  };
};

/** For a workout the user did but forgot to time. */
export const recordWorkoutManually = (
  record: HabitRecord | undefined,
  minutes: number,
  isOutdoor: boolean,
  now: Date,
): HabitRecord => ({
  ...(record ?? { completed: false }),
  sessions: [...readSessions(record), buildSession(minutes, isOutdoor, now)],
});

export const removeLastWorkout = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  sessions: readSessions(record).slice(0, -1),
});

export const countSessions = (record: HabitRecord | undefined): number =>
  readSessions(record).length;

/** Sessions long enough to count towards the rule. One definition, used by the rule and the UI. */
export const countQualifyingSessions = (
  record: HabitRecord | undefined,
  minutesRequired: number,
): number => readSessions(record).filter((session) => session.minutes >= minutesRequired).length;

export const countOutdoorSessions = (record: HabitRecord | undefined): number =>
  readSessions(record).filter((session) => session.outdoor).length;

const buildSession = (minutes: number, isOutdoor: boolean, now: Date): WorkoutSession => ({
  minutes,
  outdoor: isOutdoor,
  completedAt: now.toISOString() as IsoTimestamp,
});

/**
 * A stable key for a session in a list.
 *
 * Two sessions recorded in the same second share a `completedAt`, which made React warn about
 * duplicate keys. The position is stable here because sessions are only ever appended, and only
 * the last one is ever removed.
 */
export const buildSessionKey = (session: WorkoutSession, index: number): string =>
  `${index}-${session.completedAt}`;
