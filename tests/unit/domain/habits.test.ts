import { HABITS, findHabit } from '@/domain/habits';
import { HABIT_IDS, HabitIdEnum, TOTAL_HABITS } from '@/domain/habitIds';
import { TargetTypeEnum } from '@/domain/targets';

describe('the eleven habits', () => {
  it('defines exactly the ids the spec lists, in the order of the rules image', () => {
    expect(HABITS.map((habit) => habit.id)).toEqual([
      HabitIdEnum.NO_ALCOHOL,
      HabitIdEnum.DIET,
      HabitIdEnum.WATER,
      HabitIdEnum.WORKOUTS,
      HabitIdEnum.SKILL,
      HabitIdEnum.READING,
      HabitIdEnum.MORNING_DETOX,
      HabitIdEnum.NO_DEVICES_BED,
      HabitIdEnum.WEIGH_IN,
      HabitIdEnum.SPIRITUALITY,
      HabitIdEnum.CONNECTION,
    ]);
  });

  /**
   * Scoring iterates HABITS while the total comes from HABIT_IDS. If the two ever diverge a
   * perfect day becomes unreachable and every streak dies silently, so they are pinned together.
   */
  it('has one definition for every habit id, so a perfect day stays reachable', () => {
    expect(HABITS).toHaveLength(TOTAL_HABITS);
    expect(HABITS.map((habit) => habit.id).sort()).toEqual([...HABIT_IDS].sort());
  });

  it('numbers the habits one to eleven, matching the rules image', () => {
    expect(HABITS.map((habit) => habit.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it.each([
    [HabitIdEnum.WATER, TargetTypeEnum.LITRES, 3],
    [HabitIdEnum.WORKOUTS, TargetTypeEnum.SESSIONS, 2],
    [HabitIdEnum.SKILL, TargetTypeEnum.MINUTES, 45],
    [HabitIdEnum.READING, TargetTypeEnum.PAGES, 15],
    [HabitIdEnum.SPIRITUALITY, TargetTypeEnum.MINUTES, 15],
    [HabitIdEnum.CONNECTION, TargetTypeEnum.MINUTES, 15],
  ])('measures %s as %s with a target of %s', (habitId, targetType, targetValue) => {
    const habit = findHabit(habitId);

    expect(habit?.targetType).toBe(targetType);
    expect(habit?.targetValue).toBe(targetValue);
  });

  it.each([HabitIdEnum.NO_ALCOHOL, HabitIdEnum.DIET, HabitIdEnum.NO_DEVICES_BED])(
    'scores %s as a simple tap',
    (habitId) => {
      expect(findHabit(habitId)?.targetType).toBe(TargetTypeEnum.BOOLEAN);
    },
  );

  it('returns null for an id that is not a habit rather than inventing one', () => {
    expect(findHabit('not-a-habit' as never)).toBeNull();
  });
});
