import { findHabitForMode } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { markDone } from '@/domain/markDone';
import { ChallengeModeEnum } from '@/domain/modes';
import { calculateHabitProgress, decideShownProgress } from '@/domain/progress';
import { HabitRecord } from '@/domain/types';

const MODE = ChallengeModeEnum.HARD;

const findHabit = (habitId: string) => {
  const habit = findHabitForMode(habitId, MODE);

  if (habit === null) {
    throw new Error(`${habitId} is not in this challenge`);
  }

  return habit;
};

describe('what a readout should show', () => {
  it('is the real number while the rule is being worked at', () => {
    expect(decideShownProgress({ completed: false }, 2.5, 3)).toBe(2.5);
  });

  it('is the target once the user has marked the rule done', () => {
    expect(decideShownProgress(markDone({ completed: false }), 2.5, 3)).toBe(3);
  });

  it('is the target even when nothing at all was recorded', () => {
    expect(decideShownProgress(markDone(undefined), 0, 45)).toBe(45);
  });

  it('does not pull a number that is already past the target back down to it', () => {
    expect(decideShownProgress(markDone({ completed: false }), 50, 45)).toBe(50);
  });
});

describe('a habit marked done by hand', () => {
  const HALF_A_LITRE: HabitRecord = { completed: false, value: 0.5 };

  it('reads as its full target, not as the half it was left at', () => {
    const progress = calculateHabitProgress(findHabit(HabitIdEnum.WATER), markDone(HALF_A_LITRE));

    expect(progress.current).toBe(3);
    expect(progress.target).toBe(3);
  });

  it('reads as its real value again once the mark is taken off', () => {
    const progress = calculateHabitProgress(findHabit(HabitIdEnum.WATER), HALF_A_LITRE);

    expect(progress.current).toBe(0.5);
  });

  it('counts every session it needs, for a habit measured in sessions', () => {
    const progress = calculateHabitProgress(
      findHabit(HabitIdEnum.WORKOUTS),
      markDone({ completed: false, sessions: [] }),
    );

    expect(progress.current).toBe(2);
    expect(progress.target).toBe(2);
  });
});
