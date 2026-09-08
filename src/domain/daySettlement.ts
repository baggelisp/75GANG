import { decideDetoxIsUnsettled, settleDetox } from './detox';
import { decideTimerIsRunning, foldRunningTimer } from './timers';
import { HabitRecord } from './types';

/**
 * Banks everything in a day that is still accruing: running timers and the morning detox windows.
 *
 * `asOf` is the moment to measure against — `now` for today, and the end of that day for one
 * already past, so a timer left running overnight is worth what it ran for and not what it would
 * have run for by the time the user next opened the app.
 *
 * Lives in its own module because it is the one place that needs both timers and the detox, and
 * having them reach for each other made a require cycle that Metro warns about.
 */
export const settleDayTimers = (
  habits: Record<string, HabitRecord>,
  asOf: Date,
): Record<string, HabitRecord> =>
  Object.fromEntries(
    Object.entries(habits).map(([habitId, record]) => [
      habitId,
      settleDetox(foldRunningTimer(record, asOf), asOf),
    ]),
  );

/**
 * Whether settling this day against `asOf` would change anything.
 *
 * Asked as "would it change", not "is something running", so a day that has nothing left to gain
 * is never rewritten again — which is what stops a historical record being restamped on every
 * read for the rest of the challenge.
 */
export const decideDayNeedsSettling = (habits: Record<string, HabitRecord>, asOf: Date): boolean =>
  Object.values(habits).some(
    (record) => decideTimerIsRunning(record) || decideDetoxIsUnsettled(record, asOf),
  );
