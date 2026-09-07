import { applyHabitChange, toggleTapHabit } from '@/domain/dayRecord';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { DayRecord } from '@/domain/types';

const NOW = '2026-09-07T09:00:00.000Z';
const EASY = ChallengeModeEnum.EASY;

const emptyDay = (): DayRecord => ({
  habits: {},
  completedHabits: 0,
  totalHabits: 6,
  completionPercentage: 0,
  perfectDay: false,
  updatedAt: '2026-09-07T08:00:00.000Z',
});

describe('toggleTapHabit', () => {
  it('turns an untouched habit on', () => {
    expect(toggleTapHabit(undefined).completed).toBe(true);
  });

  it('turns a completed habit off again', () => {
    expect(toggleTapHabit({ completed: true }).completed).toBe(false);
  });

  it('keeps anything else already recorded against the habit', () => {
    const toggled = toggleTapHabit({ completed: false, value: 2.5 });

    expect(toggled.completed).toBe(true);
    expect(toggled.value).toBe(2.5);
  });
});

describe('applyHabitChange', () => {
  it('records the habit that changed', () => {
    const day = applyHabitChange(
      null,
      { habitId: HabitIdEnum.NO_ALCOHOL, record: { completed: true } },
      EASY,
      NOW,
    );

    expect(day.habits[HabitIdEnum.NO_ALCOHOL]).toEqual({ completed: true });
  });

  it('keeps every habit already recorded that day', () => {
    const existing: DayRecord = {
      ...emptyDay(),
      habits: { [HabitIdEnum.NO_ALCOHOL]: { completed: true } },
    };

    const day = applyHabitChange(
      existing,
      { habitId: HabitIdEnum.NO_DEVICES_BED, record: { completed: true } },
      EASY,
      NOW,
    );

    expect(Object.keys(day.habits).sort()).toEqual(['no-alcohol', 'no-devices-bed']);
  });

  /**
   * The counts are a projection of the habits. Recomputing rather than incrementing is what stops
   * a day claiming a score it never earned.
   */
  it('recomputes the counts rather than editing the stored ones', () => {
    const lying: DayRecord = {
      ...emptyDay(),
      habits: {},
      completedHabits: 99,
      completionPercentage: 100,
      perfectDay: true,
    };

    const day = applyHabitChange(
      lying,
      { habitId: HabitIdEnum.NO_ALCOHOL, record: { completed: true } },
      EASY,
      NOW,
    );

    expect(day.completedHabits).toBe(1);
    expect(day.completionPercentage).toBe(17);
    expect(day.perfectDay).toBe(false);
  });

  it('scores the day against the challenge being run', () => {
    const day = applyHabitChange(
      null,
      { habitId: HabitIdEnum.WATER, record: { completed: false, value: 2 } },
      EASY,
      NOW,
    );

    expect(day.totalHabits).toBe(6);
    expect(day.completedHabits).toBe(1);
  });

  it('does not count two litres on the hard challenge', () => {
    const day = applyHabitChange(
      null,
      { habitId: HabitIdEnum.WATER, record: { completed: false, value: 2 } },
      ChallengeModeEnum.HARD,
      NOW,
    );

    expect(day.completedHabits).toBe(0);
    expect(day.totalHabits).toBe(11);
  });

  it('marks a perfect day only when every rule of the challenge is met', () => {
    const habits = {
      [HabitIdEnum.NO_ALCOHOL]: { completed: true },
      [HabitIdEnum.NO_DEVICES_BED]: { completed: true },
      [HabitIdEnum.WATER]: { completed: false, value: 2 },
      [HabitIdEnum.READING]: { completed: false, value: 5 },
      [HabitIdEnum.SPIRITUALITY]: { completed: false, value: 10 },
    };

    const almost = applyHabitChange(
      { ...emptyDay(), habits },
      {
        habitId: HabitIdEnum.WORKOUTS,
        record: {
          completed: false,
          sessions: [{ minutes: 20, outdoor: false, completedAt: NOW }],
        },
      },
      EASY,
      NOW,
    );

    expect(almost.perfectDay).toBe(false);

    const perfect = applyHabitChange(
      { ...emptyDay(), habits },
      {
        habitId: HabitIdEnum.WORKOUTS,
        record: {
          completed: false,
          sessions: [{ minutes: 30, outdoor: false, completedAt: NOW }],
        },
      },
      EASY,
      NOW,
    );

    expect(perfect.perfectDay).toBe(true);
    expect(perfect.completionPercentage).toBe(100);
  });

  it('stamps when the day was last written', () => {
    const day = applyHabitChange(
      null,
      { habitId: HabitIdEnum.NO_ALCOHOL, record: { completed: true } },
      EASY,
      NOW,
    );

    expect(day.updatedAt).toBe(NOW);
  });
});
