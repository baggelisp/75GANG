import { calculateDayCompletion, decideHabitIsComplete } from '@/domain/completion';
import {
  countHabitsForMode,
  findHabitForMode,
  HABITS,
  resolveHabitsForMode,
} from '@/domain/habits';
import { HABIT_IDS, HabitIdEnum } from '@/domain/habitIds';
import { CHALLENGE_MODES, ChallengeModeEnum, isChallengeMode } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';

const withValue = (value: number): HabitRecord => ({ completed: false, value });

const session = (minutes: number) => ({
  minutes,
  outdoor: false,
  completedAt: '2026-09-07T08:00:00.000Z',
});

describe('the three challenges', () => {
  it('offers exactly easy, medium and hard', () => {
    expect(CHALLENGE_MODES).toEqual(['easy', 'medium', 'hard']);
  });

  it.each([
    [ChallengeModeEnum.EASY, 6],
    [ChallengeModeEnum.MEDIUM, 9],
    [ChallengeModeEnum.HARD, 11],
  ])('%s has %s rules', (mode, expected) => {
    expect(countHabitsForMode(mode)).toBe(expected);
  });

  it('leaves hard exactly as the rules image states it', () => {
    const hard = resolveHabitsForMode(ChallengeModeEnum.HARD);

    expect(findHabitForMode(HabitIdEnum.WATER, ChallengeModeEnum.HARD)?.targetValue).toBe(3);
    expect(findHabitForMode(HabitIdEnum.WORKOUTS, ChallengeModeEnum.HARD)?.targetValue).toBe(2);
    expect(findHabitForMode(HabitIdEnum.READING, ChallengeModeEnum.HARD)?.targetValue).toBe(15);
    expect(hard.map((habit) => habit.id)).toContain(HabitIdEnum.MORNING_DETOX);
    expect(hard.map((habit) => habit.id)).toContain(HabitIdEnum.WEIGH_IN);
  });

  /**
   * The ladder only means something if it is a ladder: every habit of a lower mode must appear in
   * the higher one, at a target that is equal or harder. Otherwise moving up is a different
   * challenge rather than a harder one.
   *
   * Checked over every habit and both target dimensions, because a hand-picked list let Medium
   * hold a skill target harder than Hard's and still pass.
   */
  it('makes every easy habit part of medium, and every medium habit part of hard', () => {
    const easy = resolveHabitsForMode(ChallengeModeEnum.EASY).map((habit) => habit.id);
    const medium = resolveHabitsForMode(ChallengeModeEnum.MEDIUM).map((habit) => habit.id);
    const hard = resolveHabitsForMode(ChallengeModeEnum.HARD).map((habit) => habit.id);

    expect(medium).toEqual(expect.arrayContaining(easy));
    expect(hard).toEqual(expect.arrayContaining(medium));
  });

  it.each([
    ['easy to medium', ChallengeModeEnum.EASY, ChallengeModeEnum.MEDIUM],
    ['medium to hard', ChallengeModeEnum.MEDIUM, ChallengeModeEnum.HARD],
  ])('never lowers a target going from %s', (_description, lighter, harder) => {
    const inversions = HABIT_IDS.flatMap((habitId) => {
      const lighterHabit = findHabitForMode(habitId, lighter);
      const harderHabit = findHabitForMode(habitId, harder);

      if (lighterHabit === null || harderHabit === null) {
        return [];
      }

      const targetDropped = (harderHabit.targetValue ?? 0) < (lighterHabit.targetValue ?? 0);
      const sessionDropped = (harderHabit.sessionMinutes ?? 0) < (lighterHabit.sessionMinutes ?? 0);

      if (!targetDropped && !sessionDropped) {
        return [];
      }

      return [habitId];
    });

    expect(inversions).toEqual([]);
  });

  it('resolves hard to the full habit catalogue, untouched by any override', () => {
    expect(resolveHabitsForMode(ChallengeModeEnum.HARD)).toEqual(HABITS);
  });

  it('counts the habits it actually resolves, so a duplicate could not hide a perfect day', () => {
    CHALLENGE_MODES.forEach((mode) => {
      expect(countHabitsForMode(mode)).toBe(resolveHabitsForMode(mode).length);
    });
  });

  it('recognises only the three modes', () => {
    expect(isChallengeMode('hard')).toBe(true);
    expect(isChallengeMode('impossible')).toBe(false);
    expect(isChallengeMode(null)).toBe(false);
  });
});

describe('the same day scored in different challenges', () => {
  it.each([
    ['easy', ChallengeModeEnum.EASY, true],
    ['medium', ChallengeModeEnum.MEDIUM, false],
    ['hard', ChallengeModeEnum.HARD, false],
  ])('scores 2 litres of water as complete on %s: %s', (_name, mode, expected) => {
    expect(decideHabitIsComplete(HabitIdEnum.WATER, withValue(2), mode)).toBe(expected);
  });

  it.each([
    ['easy', ChallengeModeEnum.EASY, true],
    ['medium', ChallengeModeEnum.MEDIUM, false],
    ['hard', ChallengeModeEnum.HARD, false],
  ])('scores 5 pages as complete on %s: %s', (_name, mode, expected) => {
    expect(decideHabitIsComplete(HabitIdEnum.READING, withValue(5), mode)).toBe(expected);
  });

  it('accepts one 30 minute workout on easy', () => {
    const record: HabitRecord = { completed: false, sessions: [session(30)] };

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, record, ChallengeModeEnum.EASY)).toBe(true);
  });

  it('rejects one 30 minute workout on medium, which wants 45', () => {
    const record: HabitRecord = { completed: false, sessions: [session(30)] };

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, record, ChallengeModeEnum.MEDIUM)).toBe(
      false,
    );
  });

  it('rejects one 45 minute workout on hard, which wants two', () => {
    const record: HabitRecord = { completed: false, sessions: [session(45)] };

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, record, ChallengeModeEnum.HARD)).toBe(false);
  });

  it('ignores a habit that belongs to a harder challenge', () => {
    const record: HabitRecord = { completed: false, weightKg: 88.4, photo: 'photos/x.jpg' };

    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record, ChallengeModeEnum.EASY)).toBe(false);
  });

  it('counts a perfect easy day out of six, not eleven', () => {
    const habits: Record<string, HabitRecord> = {
      [HabitIdEnum.NO_ALCOHOL]: { completed: true },
      [HabitIdEnum.WATER]: withValue(2),
      [HabitIdEnum.WORKOUTS]: { completed: false, sessions: [session(30)] },
      [HabitIdEnum.READING]: withValue(5),
      [HabitIdEnum.NO_DEVICES_BED]: { completed: true },
      [HabitIdEnum.SPIRITUALITY]: withValue(10),
    };

    const day = calculateDayCompletion(habits, ChallengeModeEnum.EASY);

    expect(day.totalHabits).toBe(6);
    expect(day.completedHabits).toBe(6);
    expect(day.perfectDay).toBe(true);
  });

  it('does not let a habit from a harder challenge inflate an easy day', () => {
    const habits: Record<string, HabitRecord> = {
      [HabitIdEnum.NO_ALCOHOL]: { completed: true },
      [HabitIdEnum.DIET]: { completed: true },
      [HabitIdEnum.CONNECTION]: withValue(15),
    };

    expect(calculateDayCompletion(habits, ChallengeModeEnum.EASY).completedHabits).toBe(1);
  });
});
