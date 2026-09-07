import { HABITS } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { decideTracker, TrackerEnum } from '@/features/habit-detail/decideTracker';

const findHabit = (habitId: string) => {
  const habit = HABITS.find((candidate) => candidate.id === habitId);

  if (habit === undefined) {
    throw new Error(`${habitId} is not a habit`);
  }

  return habit;
};

describe('decideTracker', () => {
  it.each([
    [HabitIdEnum.WATER, TrackerEnum.COUNTER],
    [HabitIdEnum.READING, TrackerEnum.COUNTER],
    [HabitIdEnum.SKILL, TrackerEnum.TIMER],
    [HabitIdEnum.SPIRITUALITY, TrackerEnum.TIMER],
    [HabitIdEnum.CONNECTION, TrackerEnum.TIMER],
    [HabitIdEnum.WORKOUTS, TrackerEnum.WORKOUTS],
    [HabitIdEnum.MORNING_DETOX, TrackerEnum.NOT_BUILT_YET],
    [HabitIdEnum.WEIGH_IN, TrackerEnum.NOT_BUILT_YET],
    [HabitIdEnum.NO_ALCOHOL, TrackerEnum.NOT_BUILT_YET],
  ])('gives %s the %s tracker', (habitId, expected) => {
    expect(decideTracker(findHabit(habitId))).toBe(expected);
  });

  /** Every habit must resolve to something; a fall-through is what put a raw key on screen. */
  it('decides a tracker for all eleven habits', () => {
    HABITS.forEach((habit) => {
      expect(Object.values(TrackerEnum)).toContain(decideTracker(habit));
    });
  });
});
