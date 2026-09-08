import { IsoDate } from './types';

export type CompletionSnapshot = {
  date: IsoDate;
  completedHabits: number;
  totalHabits: number;
};

const decideIsPerfect = (snapshot: CompletionSnapshot): boolean =>
  snapshot.totalHabits > 0 && snapshot.completedHabits >= snapshot.totalHabits;

/**
 * Whether the day has just become perfect.
 *
 * It is the *transition* that is celebrated, never the state. That is what makes it fire once and
 * not on every render, and it is why nothing has to be stored to remember that it already fired:
 * a screen opened on an already-perfect day has no previous state to have moved from, so it
 * stays quiet. Yesterday is never a previous state either — a new day starts at nothing done.
 *
 * A previous snapshot with no rules in it is not a state either. That is what a screen looks like
 * before its first read has landed, and treating it as "nothing done" would fire the celebration
 * every time someone opened the app on a day they had already finished.
 */
export const decideCelebrates = (
  previous: CompletionSnapshot | null,
  current: CompletionSnapshot,
): boolean => {
  if (previous === null || previous.date !== current.date || previous.totalHabits === 0) {
    return false;
  }

  if (!decideIsPerfect(current)) {
    return false;
  }

  return !decideIsPerfect(previous);
};
