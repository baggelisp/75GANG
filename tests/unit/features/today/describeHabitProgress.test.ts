import { findHabitForMode } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';
import { describeHabitProgress } from '@/features/today/describeHabitProgress';

const HARD = ChallengeModeEnum.HARD;

const habit = (habitId: string) => {
  const found = findHabitForMode(habitId, HARD);

  if (found === null) {
    throw new Error(`${habitId} is not part of the hard challenge`);
  }

  return found;
};

describe('describeHabitProgress', () => {
  it('says nothing about a simple tap, because the checkbox already says it', () => {
    expect(describeHabitProgress(habit(HabitIdEnum.NO_ALCOHOL), { completed: true })).toBeNull();
  });

  it('reports litres against the target', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.WATER), {
      completed: false,
      value: 2.5,
    });

    expect(progress).toEqual({ key: 'today.progress.litres', values: { current: 2.5, target: 3 } });
  });

  it('reports pages against the target', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.READING), {
      completed: false,
      value: 12,
    });

    expect(progress).toEqual({ key: 'today.progress.pages', values: { current: 12, target: 15 } });
  });

  it('counts only the workout sessions that were long enough', () => {
    const record: HabitRecord = {
      completed: false,
      sessions: [
        { minutes: 48, outdoor: true, completedAt: '2026-09-07T08:00:00.000Z' },
        { minutes: 20, outdoor: false, completedAt: '2026-09-07T18:00:00.000Z' },
      ],
    };

    const progress = describeHabitProgress(habit(HabitIdEnum.WORKOUTS), record);

    expect(progress).toEqual({ key: 'today.progressSessions', values: { done: 1, total: 2 } });
  });

  it('reports both detox windows', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.MORNING_DETOX), {
      completed: false,
      phoneFreeMinutes: 60,
      noContentMinutes: 145,
    });

    expect(progress).toEqual({
      key: 'today.progressWindows',
      values: { phone: 60, content: 145 },
    });
  });

  it('asks for both the weight and the photo until it has them', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.WEIGH_IN), {
      completed: false,
      weightKg: 88.4,
    });

    expect(progress?.key).toBe('today.progressWeighInPending');
  });

  it('reports the weight once the photo is there too', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.WEIGH_IN), {
      completed: false,
      weightKg: 88.4,
      photo: 'photos/2026-09-07.jpg',
    });

    expect(progress).toEqual({ key: 'today.progressWeighInDone', values: { weight: 88.4 } });
  });

  it('reads a missing record as nothing done rather than crashing', () => {
    const progress = describeHabitProgress(habit(HabitIdEnum.WATER), undefined);

    expect(progress).toEqual({ key: 'today.progress.litres', values: { current: 0, target: 3 } });
  });

  it('uses the mode target, so easy reports out of two litres', () => {
    const easyWater = findHabitForMode(HabitIdEnum.WATER, ChallengeModeEnum.EASY);

    const progress = describeHabitProgress(easyWater!, { completed: false, value: 1 });

    expect(progress?.values.target).toBe(2);
  });
});
