import { addCalendarDays, countDaysBetween } from './calendar';
import { CHALLENGE_LENGTH_DAYS } from './challenge';
import { calculateDayCompletion } from './completion';
import { ChallengeMode } from './modes';
import { DayRecordsByDate, IsoDate } from './types';

export const DayStateEnum = {
  PERFECT: 'PERFECT',
  MISSED: 'MISSED',
  TODAY: 'TODAY',
  TO_COME: 'TO_COME',
} as const;

export type DayState = (typeof DayStateEnum)[keyof typeof DayStateEnum];

export type GridDay = {
  readonly dayNumber: number;
  readonly date: IsoDate;
  readonly state: DayState;
  readonly completedHabits: number;
  readonly totalHabits: number;
};

/**
 * The seventy-five cells, derived from the day records rather than from a stored grid.
 *
 * A day with no record at all is missed, not an error: the user simply did not open the app, and
 * the grid should say so plainly. Completion is recomputed against the challenge's own rules, so
 * a stale stored flag cannot colour a cell it did not earn.
 */
export const buildProgressGrid = (
  startDate: IsoDate,
  today: IsoDate,
  history: DayRecordsByDate,
  mode: ChallengeMode,
): readonly GridDay[] => {
  const elapsed = countDaysBetween(startDate, today);

  return Array.from({ length: CHALLENGE_LENGTH_DAYS }, (_unused, index) => {
    const date = addCalendarDays(startDate, index) ?? startDate;
    const record = history[date];
    const completion =
      record === undefined
        ? { completedHabits: 0, totalHabits: 0, perfectDay: false }
        : calculateDayCompletion(record.habits, mode);

    return {
      dayNumber: index + 1,
      date,
      state: decideDayState(index, elapsed, completion.perfectDay),
      completedHabits: completion.completedHabits,
      totalHabits: completion.totalHabits,
    };
  });
};

const decideDayState = (index: number, elapsed: number | null, isPerfect: boolean): DayState => {
  if (elapsed === null || index > elapsed) {
    return DayStateEnum.TO_COME;
  }

  if (index === elapsed) {
    return DayStateEnum.TODAY;
  }

  return isPerfect ? DayStateEnum.PERFECT : DayStateEnum.MISSED;
};

export const countPerfectDays = (grid: readonly GridDay[]): number =>
  grid.filter((day) => day.state === DayStateEnum.PERFECT).length;

export const decideIsTappable = (day: GridDay): boolean => day.state !== DayStateEnum.TO_COME;
