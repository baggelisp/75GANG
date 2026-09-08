import { decideHabitIsComplete } from '@/domain/completion';
import { clearMarkedDone, decideIsMarkedDone, markDone } from '@/domain/markDone';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';

const MODE = ChallengeModeEnum.HARD;

const A_MORNING_HALF_DONE: HabitRecord = {
  completed: false,
  wokeUpAt: '2026-09-08T07:00:00.000Z',
  phoneFreeMinutes: 60,
  noContentMinutes: 95,
};

describe('a rule the counters say is not done', () => {
  it('is not complete on its own', () => {
    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, A_MORNING_HALF_DONE, MODE)).toBe(false);
  });

  it('is complete once the user marks it done by hand', () => {
    const marked = markDone(A_MORNING_HALF_DONE);

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, marked, MODE)).toBe(true);
  });

  it('goes back to what the counters say when the mark is taken off', () => {
    const undone = clearMarkedDone(markDone(A_MORNING_HALF_DONE));

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, undone, MODE)).toBe(false);
  });
});

describe('marking done', () => {
  it('keeps every number that was already recorded', () => {
    const marked = markDone(A_MORNING_HALF_DONE);

    expect(marked.phoneFreeMinutes).toBe(60);
    expect(marked.noContentMinutes).toBe(95);
    expect(marked.wokeUpAt).toBe('2026-09-08T07:00:00.000Z');
  });

  it('is visible as a hand mark, so the screen can say it was not earned by the counter', () => {
    expect(decideIsMarkedDone(markDone(A_MORNING_HALF_DONE))).toBe(true);
    expect(decideIsMarkedDone(A_MORNING_HALF_DONE)).toBe(false);
  });

  it('works from nothing at all, for a rule never touched today', () => {
    expect(decideHabitIsComplete(HabitIdEnum.SKILL, markDone(undefined), MODE)).toBe(true);
  });
});

describe('a rule the counters already say is done', () => {
  const FULL_MORNING: HabitRecord = {
    completed: false,
    wokeUpAt: '2026-09-08T07:00:00.000Z',
    phoneFreeMinutes: 60,
    noContentMinutes: 180,
  };

  it('stays done after the hand mark is taken off, because the numbers still stand', () => {
    const undone = clearMarkedDone(markDone(FULL_MORNING));

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, undone, MODE)).toBe(true);
  });

  it('is not reported as a hand mark, since the counter earned it', () => {
    expect(decideIsMarkedDone(FULL_MORNING)).toBe(false);
  });
});

describe('every kind of rule', () => {
  it.each([
    [HabitIdEnum.WATER, { completed: false, value: 0.5 }],
    [HabitIdEnum.READING, { completed: false, value: 1 }],
    [HabitIdEnum.SKILL, { completed: false, value: 5 }],
    [HabitIdEnum.WORKOUTS, { completed: false, sessions: [] }],
    [HabitIdEnum.WEIGH_IN, { completed: false }],
    [HabitIdEnum.MORNING_DETOX, A_MORNING_HALF_DONE],
  ])('can be marked done by hand: %s', (habitId, record) => {
    expect(decideHabitIsComplete(habitId, record as HabitRecord, MODE)).toBe(false);
    expect(decideHabitIsComplete(habitId, markDone(record as HabitRecord), MODE)).toBe(true);
  });
});
