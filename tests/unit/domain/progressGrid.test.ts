import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import {
  buildProgressGrid,
  countPerfectDays,
  DayStateEnum,
  decideIsTappable,
} from '@/domain/progressGrid';
import { DayRecordsByDate, HabitRecord } from '@/domain/types';

const START = '2026-09-01';
const EASY = ChallengeModeEnum.EASY;

const perfectEasyHabits = (): Record<string, HabitRecord> => ({
  [HabitIdEnum.NO_ALCOHOL]: { completed: true },
  [HabitIdEnum.NO_DEVICES_BED]: { completed: true },
  [HabitIdEnum.WATER]: { completed: false, value: 2 },
  [HabitIdEnum.WORKOUTS]: {
    completed: false,
    sessions: [{ minutes: 30, outdoor: false, completedAt: '2026-09-01T08:00:00.000Z' }],
  },
  [HabitIdEnum.READING]: { completed: false, value: 5 },
  [HabitIdEnum.SPIRITUALITY]: { completed: false, value: 10 },
});

const dayRecord = (isPerfect: boolean) => ({
  habits: isPerfect ? perfectEasyHabits() : { [HabitIdEnum.NO_ALCOHOL]: { completed: true } },
  completedHabits: isPerfect ? 6 : 1,
  totalHabits: 6,
  completionPercentage: isPerfect ? 100 : 17,
  perfectDay: isPerfect,
  updatedAt: '2026-09-01T21:00:00.000Z',
});

const historyOf = (entries: Record<string, boolean>): DayRecordsByDate =>
  Object.fromEntries(Object.entries(entries).map(([date, perfect]) => [date, dayRecord(perfect)]));

describe('the grid on day 1', () => {
  const grid = buildProgressGrid(START, START, {}, EASY);

  it('has seventy five cells', () => {
    expect(grid).toHaveLength(75);
  });

  it('marks day one as today', () => {
    expect(grid[0]?.state).toBe(DayStateEnum.TODAY);
  });

  it('marks every other day as still to come', () => {
    expect(grid.slice(1).every((day) => day.state === DayStateEnum.TO_COME)).toBe(true);
  });

  it('counts no perfect days yet', () => {
    expect(countPerfectDays(grid)).toBe(0);
  });
});

describe('the grid mid-challenge with gaps', () => {
  const history = historyOf({
    '2026-09-01': true,
    '2026-09-02': true,
    '2026-09-04': false,
    '2026-09-06': true,
  });
  const grid = buildProgressGrid(START, '2026-09-10', history, EASY);

  it('marks a day with no record as missed rather than as an error', () => {
    expect(grid[2]?.state).toBe(DayStateEnum.MISSED);
    expect(grid[2]?.completedHabits).toBe(0);
  });

  it('marks a recorded but imperfect day as missed', () => {
    expect(grid[3]?.state).toBe(DayStateEnum.MISSED);
  });

  it('marks the perfect days', () => {
    expect(grid[0]?.state).toBe(DayStateEnum.PERFECT);
    expect(grid[5]?.state).toBe(DayStateEnum.PERFECT);
  });

  it('marks today', () => {
    expect(grid[9]?.state).toBe(DayStateEnum.TODAY);
  });

  it('counts only the days that were genuinely perfect', () => {
    expect(countPerfectDays(grid)).toBe(3);
  });

  it('gives every cell the date it stands for', () => {
    expect(grid[0]?.date).toBe('2026-09-01');
    expect(grid[9]?.date).toBe('2026-09-10');
    expect(grid[30]?.date).toBe('2026-10-01');
  });
});

describe('the grid on the last day', () => {
  const grid = buildProgressGrid(START, '2026-11-14', {}, EASY);

  it('marks day seventy five as today', () => {
    expect(grid[74]?.state).toBe(DayStateEnum.TODAY);
  });

  it('has nothing left to come', () => {
    expect(grid.some((day) => day.state === DayStateEnum.TO_COME)).toBe(false);
  });
});

describe('tapping a cell', () => {
  const grid = buildProgressGrid(START, '2026-09-10', {}, EASY);

  it('opens a past day', () => {
    expect(decideIsTappable(grid[3]!)).toBe(true);
  });

  it('opens today', () => {
    expect(decideIsTappable(grid[9]!)).toBe(true);
  });

  it('does nothing on a day that has not happened', () => {
    expect(decideIsTappable(grid[10]!)).toBe(false);
  });
});

describe('a start date that is not a real date', () => {
  it('treats every day as still to come rather than throwing', () => {
    const grid = buildProgressGrid(START, '2026-02-30', {}, EASY);

    expect(grid.every((day) => day.state === DayStateEnum.TO_COME)).toBe(true);
  });
});
