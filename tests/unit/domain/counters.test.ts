import { decideHabitIsComplete } from '@/domain/completion';
import { applyCounterStep, decideIsCounter, findCounter } from '@/domain/counters';
import { findHabitForMode } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';

const HARD = ChallengeModeEnum.HARD;

const habit = (habitId: string) => {
  const found = findHabitForMode(habitId, HARD);

  if (found === null) {
    throw new Error(`${habitId} is not part of the hard challenge`);
  }

  return found;
};

const stepsOf = (habitId: string): readonly number[] =>
  (findCounter(habit(habitId))?.steps ?? []).map((step) => step.amount);

describe('findCounter', () => {
  it('offers 250 ml, 500 ml and a litre for water', () => {
    expect(stepsOf(HabitIdEnum.WATER)).toEqual([0.25, 0.5, 1]);
  });

  it('offers one page and five for reading', () => {
    expect(stepsOf(HabitIdEnum.READING)).toEqual([1, 5]);
  });

  it('offers nothing for a habit that is not counted', () => {
    expect(findCounter(habit(HabitIdEnum.NO_ALCOHOL))).toBeNull();
    expect(decideIsCounter(habit(HabitIdEnum.NO_ALCOHOL))).toBe(false);
  });

  it.each([HabitIdEnum.WATER, HabitIdEnum.READING])('recognises %s as a counter', (habitId) => {
    expect(decideIsCounter(habit(habitId))).toBe(true);
  });

  it.each([HabitIdEnum.WORKOUTS, HabitIdEnum.MORNING_DETOX, HabitIdEnum.WEIGH_IN])(
    'offers no counter for %s, whose tracker is not a counter',
    (habitId) => {
      expect(findCounter(habit(habitId))).toBeNull();
    },
  );

  it('states one fixed undo step per counter, rather than a history of taps', () => {
    expect(findCounter(habit(HabitIdEnum.WATER))?.undo.amount).toBe(-0.25);
    expect(findCounter(habit(HabitIdEnum.READING))?.undo.amount).toBe(-1);
  });
});

describe('applyCounterStep', () => {
  it('starts from zero when nothing was recorded', () => {
    expect(applyCounterStep(undefined, 0.25, 2).value).toBe(0.25);
  });

  it('adds to what is already there', () => {
    expect(applyCounterStep({ completed: false, value: 2 }, 0.5, 2).value).toBe(2.5);
  });

  it('lands exactly on the target after twelve 250 ml steps', () => {
    const twelveGlasses = Array.from({ length: 12 }).reduce<HabitRecord>(
      (record) => applyCounterStep(record, 0.25, 2),
      { completed: false },
    );

    expect(twelveGlasses.value).toBe(3);
  });

  /**
   * The quarter and half litre steps happen to be exact in binary, so they never drift. Any step
   * that is not a power of two does, and the rounding is what stops 0.30000000000000004 reaching
   * the screen and the store.
   */
  it('does not let floating point dust reach the stored value', () => {
    const drifted = applyCounterStep({ completed: false, value: 0.1 }, 0.2, 2);

    expect(drifted.value).toBe(0.3);
  });

  it('keeps a value above the target rather than clamping it away', () => {
    expect(applyCounterStep({ completed: false, value: 3 }, 1, 2).value).toBe(4);
  });

  it('subtracts on a negative step, so a mis-tap is recoverable', () => {
    expect(applyCounterStep({ completed: false, value: 2.5 }, -0.25, 2).value).toBe(2.25);
  });

  it('floors at zero rather than recording a negative amount', () => {
    expect(applyCounterStep({ completed: false, value: 0.25 }, -1, 2).value).toBe(0);
  });

  it('leaves the rest of the record alone', () => {
    const stepped = applyCounterStep({ completed: true, value: 1 }, 1, 2);

    expect(stepped.completed).toBe(true);
  });
});

describe('a counter against its own rule', () => {
  it.each([
    ['2.75 litres', 2.75, false],
    ['2.9 litres', 2.9, false],
    ['3 litres', 3, true],
    ['4 litres', 4, true],
  ])('scores water at %s as complete: %s', (_description, value, expected) => {
    expect(decideHabitIsComplete(HabitIdEnum.WATER, { completed: false, value }, HARD)).toBe(
      expected,
    );
  });

  it.each([
    ['14 pages', 14, false],
    ['15 pages', 15, true],
    ['40 pages', 40, true],
  ])('scores reading at %s as complete: %s', (_description, value, expected) => {
    expect(decideHabitIsComplete(HabitIdEnum.READING, { completed: false, value }, HARD)).toBe(
      expected,
    );
  });

  it('reaches the easy target two litres sooner', () => {
    expect(
      decideHabitIsComplete(
        HabitIdEnum.WATER,
        { completed: false, value: 2 },
        ChallengeModeEnum.EASY,
      ),
    ).toBe(true);
  });
});
