import { decideHabitIsComplete } from '@/domain/completion';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { decideTimerIsRunning } from '@/domain/timers';
import { HabitRecord } from '@/domain/types';
import {
  countOutdoorSessions,
  countSessions,
  finishWorkout,
  recordWorkoutManually,
  removeLastWorkout,
  startWorkout,
} from '@/domain/workouts';

const NINE = new Date('2026-09-07T09:00:00.000Z');
const NINE_FORTY_FOUR = new Date('2026-09-07T09:44:00.000Z');
const NINE_FORTY_FIVE = new Date('2026-09-07T09:45:00.000Z');
const TEN_THIRTY = new Date('2026-09-07T10:30:00.000Z');
const HARD = ChallengeModeEnum.HARD;

const runWorkout = (
  record: HabitRecord | undefined,
  from: Date,
  to: Date,
  isOutdoor = false,
): HabitRecord => finishWorkout(startWorkout(record, from, isOutdoor), to);

describe('timing a workout', () => {
  it('marks it running once started', () => {
    expect(decideTimerIsRunning(startWorkout(undefined, NINE, false))).toBe(true);
  });

  it('records one session of the minutes it ran', () => {
    const finished = runWorkout(undefined, NINE, NINE_FORTY_FIVE);

    expect(countSessions(finished)).toBe(1);
    expect(finished.sessions?.[0]?.minutes).toBe(45);
  });

  it('stops the timer when the workout is finished', () => {
    expect(decideTimerIsRunning(runWorkout(undefined, NINE, NINE_FORTY_FIVE))).toBe(false);
  });

  it('remembers whether the workout was outdoors', () => {
    const finished = runWorkout(undefined, NINE, NINE_FORTY_FIVE, true);

    expect(countOutdoorSessions(finished)).toBe(1);
  });

  it('records a short workout rather than discarding it silently', () => {
    const finished = runWorkout(undefined, NINE, NINE_FORTY_FOUR);

    expect(countSessions(finished)).toBe(1);
    expect(finished.sessions?.[0]?.minutes).toBe(44);
  });

  it('does nothing when there is no workout running', () => {
    expect(finishWorkout({ completed: false }, NINE_FORTY_FIVE).sessions).toBeUndefined();
  });
});

describe('rule 4: two workouts of forty five minutes', () => {
  /** The rule says two workouts. Ninety minutes in one go is one workout, however long it ran. */
  it('does not count one ninety minute session as two workouts', () => {
    const marathon = runWorkout(undefined, NINE, TEN_THIRTY);

    expect(countSessions(marathon)).toBe(1);
    expect(marathon.sessions?.[0]?.minutes).toBe(90);
    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, marathon, HARD)).toBe(false);
  });

  it('is incomplete after two sessions of forty four minutes', () => {
    const first = runWorkout(undefined, NINE, NINE_FORTY_FOUR);
    const second = runWorkout(first, NINE, NINE_FORTY_FOUR);

    expect(countSessions(second)).toBe(2);
    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, second, HARD)).toBe(false);
  });

  it('is complete after two sessions of forty five minutes', () => {
    const first = runWorkout(undefined, NINE, NINE_FORTY_FIVE);
    const second = runWorkout(first, NINE, NINE_FORTY_FIVE);

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, second, HARD)).toBe(true);
  });

  it('is complete on easy after a single thirty minute session', () => {
    const single = runWorkout(undefined, NINE, new Date('2026-09-07T09:30:00.000Z'));

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, single, ChallengeModeEnum.EASY)).toBe(true);
  });
});

describe('a workout the user forgot to time', () => {
  it('can be recorded by hand', () => {
    const recorded = recordWorkoutManually(undefined, 50, true, NINE_FORTY_FIVE);

    expect(countSessions(recorded)).toBe(1);
    expect(recorded.sessions?.[0]?.minutes).toBe(50);
    expect(countOutdoorSessions(recorded)).toBe(1);
  });

  it('counts towards the rule like any other session', () => {
    const first = recordWorkoutManually(undefined, 45, false, NINE_FORTY_FIVE);
    const second = recordWorkoutManually(first, 45, true, NINE_FORTY_FIVE);

    expect(decideHabitIsComplete(HabitIdEnum.WORKOUTS, second, HARD)).toBe(true);
  });

  it('can be taken back off when recorded by mistake', () => {
    const recorded = recordWorkoutManually(undefined, 50, false, NINE_FORTY_FIVE);

    expect(countSessions(removeLastWorkout(recorded))).toBe(0);
  });

  it('removing from an empty list is harmless', () => {
    expect(countSessions(removeLastWorkout(undefined))).toBe(0);
  });
});
