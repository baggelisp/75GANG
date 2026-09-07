import { calculateDayCompletion, decideHabitIsComplete } from '@/domain/completion';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';

const HARD = ChallengeModeEnum.HARD;

const boolean = (completed: boolean): HabitRecord => ({ completed });
const withValue = (value: number): HabitRecord => ({ completed: false, value });

describe('decideHabitIsComplete for a tapped habit', () => {
  it.each([
    [HabitIdEnum.NO_ALCOHOL, true],
    [HabitIdEnum.DIET, true],
    [HabitIdEnum.NO_DEVICES_BED, true],
  ])('treats %s as complete when it is tapped', (habitId, completed) => {
    expect(decideHabitIsComplete(habitId, boolean(completed), HARD)).toBe(true);
  });

  it.each([HabitIdEnum.NO_ALCOHOL, HabitIdEnum.DIET, HabitIdEnum.NO_DEVICES_BED])(
    'treats %s as incomplete while it is untapped',
    (habitId) => {
      expect(decideHabitIsComplete(habitId, boolean(false), HARD)).toBe(false);
    },
  );
});

describe('decideHabitIsComplete at the counter boundaries', () => {
  it.each([
    ['water at 2.9 litres', HabitIdEnum.WATER, 2.9, false],
    ['water at 3 litres', HabitIdEnum.WATER, 3, true],
    ['water past the target', HabitIdEnum.WATER, 3.5, true],
    ['reading at 14 pages', HabitIdEnum.READING, 14, false],
    ['reading at 15 pages', HabitIdEnum.READING, 15, true],
    ['skill at 44 minutes', HabitIdEnum.SKILL, 44, false],
    ['skill at 45 minutes', HabitIdEnum.SKILL, 45, true],
    ['spirituality at 14 minutes', HabitIdEnum.SPIRITUALITY, 14, false],
    ['spirituality at 15 minutes', HabitIdEnum.SPIRITUALITY, 15, true],
    ['connection at 14 minutes', HabitIdEnum.CONNECTION, 14, false],
    ['connection at 15 minutes', HabitIdEnum.CONNECTION, 15, true],
  ])('scores %s as %s', (_description, habitId, value, expected) => {
    expect(decideHabitIsComplete(habitId, withValue(value), HARD)).toBe(expected);
  });

  it('treats a missing value as incomplete rather than as zero-complete', () => {
    expect(decideHabitIsComplete(HabitIdEnum.WATER, { completed: false }, HARD)).toBe(false);
  });
});

describe('decideHabitIsComplete for the two workouts', () => {
  const session = (minutes: number) => ({
    minutes,
    outdoor: false,
    completedAt: '2026-09-07T08:00:00.000Z',
  });

  it.each([
    ['no sessions', [], false],
    ['one session of 60 minutes', [session(60)], false],
    ['two sessions of 44 minutes', [session(44), session(44)], false],
    ['one of 45 and one of 44', [session(45), session(44)], false],
    ['two sessions of 45 minutes', [session(45), session(45)], true],
    ['three sessions of 45 minutes', [session(45), session(45), session(45)], true],
  ])('scores %s as %s', (_description, sessions, expected) => {
    const record: HabitRecord = { completed: false, sessions };

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, record, HARD)).toBe(expected);
  });
});

describe('decideHabitIsComplete for the morning detox', () => {
  it.each([
    ['neither window finished', 0, 0, false],
    ['the phone window only', 60, 0, false],
    ['the content window one minute short', 60, 179, false],
    ['both windows finished', 60, 180, true],
    ['both windows overrun', 75, 200, true],
    ['the content window done but the phone window short', 59, 180, false],
  ])('scores %s as %s', (_description, phoneFreeMinutes, noContentMinutes, expected) => {
    const record: HabitRecord = { completed: false, phoneFreeMinutes, noContentMinutes };

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, record, HARD)).toBe(expected);
  });
});

describe('decideHabitIsComplete for the weigh-in', () => {
  it.each([
    ['a weight but no photo', { completed: false, weightKg: 88.4 }, false],
    ['a photo but no weight', { completed: false, photo: 'photos/2026-09-07.jpg' }, false],
    ['neither', { completed: false }, false],
    [
      'both a weight and a photo',
      { completed: false, weightKg: 88.4, photo: 'photos/2026-09-07.jpg' },
      true,
    ],
  ])('scores %s as %s', (_description, record, expected) => {
    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record as HabitRecord, HARD)).toBe(expected);
  });
});

describe('calculateDayCompletion', () => {
  const allEleven = (completedIds: readonly string[]): Record<string, HabitRecord> =>
    Object.fromEntries(completedIds.map((id) => [id, { completed: true }]));

  /**
   * A genuinely perfect day. Completion is derived from the recorded values, so a measured habit
   * needs its value — a bare `completed: true` on the water habit is not three litres drunk.
   */
  const aPerfectDay = (): Record<string, HabitRecord> => ({
    [HabitIdEnum.NO_ALCOHOL]: { completed: true },
    [HabitIdEnum.DIET]: { completed: true },
    [HabitIdEnum.WATER]: withValue(3),
    [HabitIdEnum.WORKOUTS]: {
      completed: false,
      sessions: [
        { minutes: 45, outdoor: true, completedAt: '2026-09-07T08:00:00.000Z' },
        { minutes: 50, outdoor: false, completedAt: '2026-09-07T18:00:00.000Z' },
      ],
    },
    [HabitIdEnum.SKILL]: withValue(45),
    [HabitIdEnum.READING]: withValue(15),
    [HabitIdEnum.MORNING_DETOX]: {
      completed: false,
      phoneFreeMinutes: 60,
      noContentMinutes: 180,
    },
    [HabitIdEnum.NO_DEVICES_BED]: { completed: true },
    [HabitIdEnum.WEIGH_IN]: {
      completed: false,
      weightKg: 88.4,
      photo: 'photos/2026-09-07.jpg',
    },
    [HabitIdEnum.SPIRITUALITY]: withValue(15),
    [HabitIdEnum.CONNECTION]: withValue(15),
  });

  it('reports an untouched day as zero of eleven', () => {
    const day = calculateDayCompletion({}, HARD);

    expect(day.completedHabits).toBe(0);
    expect(day.totalHabits).toBe(11);
    expect(day.completionPercentage).toBe(0);
    expect(day.perfectDay).toBe(false);
  });

  it('counts only the habits that meet their target', () => {
    const habits = {
      [HabitIdEnum.NO_ALCOHOL]: { completed: true },
      [HabitIdEnum.WATER]: withValue(2.9),
      [HabitIdEnum.READING]: withValue(15),
    };

    expect(calculateDayCompletion(habits, HARD).completedHabits).toBe(2);
  });

  it.each([
    [[HabitIdEnum.NO_ALCOHOL, HabitIdEnum.DIET], 18],
    [[HabitIdEnum.NO_ALCOHOL], 9],
  ])('rounds the percentage to the nearest whole number, not down', (completedIds, expected) => {
    expect(calculateDayCompletion(allEleven(completedIds), HARD).completionPercentage).toBe(
      expected,
    );
  });

  it('rounds ten of eleven up to 91 rather than down to 90', () => {
    const habits = { ...aPerfectDay(), [HabitIdEnum.CONNECTION]: withValue(0) };

    expect(calculateDayCompletion(habits, HARD).completionPercentage).toBe(91);
  });

  it('calls eleven of eleven a perfect day', () => {
    const day = calculateDayCompletion(aPerfectDay(), HARD);

    expect(day.completedHabits).toBe(11);
    expect(day.completionPercentage).toBe(100);
    expect(day.perfectDay).toBe(true);
  });

  it('is not a perfect day when a measured habit is only flagged, never measured', () => {
    const habits = { ...aPerfectDay(), [HabitIdEnum.WATER]: { completed: true } };

    const day = calculateDayCompletion(habits, HARD);

    expect(day.completedHabits).toBe(10);
    expect(day.perfectDay).toBe(false);
  });

  it('ignores a habit id it does not recognise instead of counting it', () => {
    const habits = { 'not-a-habit': { completed: true } };

    expect(calculateDayCompletion(habits, HARD).completedHabits).toBe(0);
  });
});
