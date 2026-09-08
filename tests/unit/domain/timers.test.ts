import {
  calculateElapsedMinutes,
  calculateTimerMinutes,
  decideTimerIsRunning,
  foldRunningTimer,
  pauseTimer,
  startTimer,
} from '@/domain/timers';
import { HabitRecord } from '@/domain/types';

const NINE = new Date('2026-09-07T09:00:00.000Z');
const NINE_FIFTEEN = new Date('2026-09-07T09:15:00.000Z');
const TEN = new Date('2026-09-07T10:00:00.000Z');

describe('calculateElapsedMinutes', () => {
  it('is zero for a timer that was never started', () => {
    expect(calculateElapsedMinutes(null, TEN)).toBe(0);
    expect(calculateElapsedMinutes(undefined, TEN)).toBe(0);
  });

  it('counts the minutes since the timer started', () => {
    expect(calculateElapsedMinutes(NINE.toISOString(), NINE_FIFTEEN)).toBe(15);
  });

  it('counts an hour as sixty minutes', () => {
    expect(calculateElapsedMinutes(NINE.toISOString(), TEN)).toBe(60);
  });

  /** A clock that moved backwards must never take minutes away from the user. */
  it('is zero when the start is in the future rather than a negative amount', () => {
    expect(calculateElapsedMinutes(TEN.toISOString(), NINE)).toBe(0);
  });

  it('is zero for a timestamp that is not a date', () => {
    expect(calculateElapsedMinutes('not a timestamp', TEN)).toBe(0);
  });

  /**
   * The reason a start timestamp is stored rather than a tick counter: the app is closed for the
   * whole hour and the timer is still worth an hour when it is next read.
   */
  it('counts time that passed while the app was closed', () => {
    const startedBeforeQuitting = NINE.toISOString();

    expect(calculateElapsedMinutes(startedBeforeQuitting, TEN)).toBe(60);
  });
});

describe('starting and pausing', () => {
  it('marks a started timer as running', () => {
    const started = startTimer(undefined, NINE);

    expect(decideTimerIsRunning(started)).toBe(true);
    expect(started.startedAt).toBe(NINE.toISOString());
  });

  it('banks the minutes and stops when paused', () => {
    const started = startTimer(undefined, NINE);

    const paused = pauseTimer(started, NINE_FIFTEEN);

    expect(paused.value).toBe(15);
    expect(paused.startedAt).toBeNull();
    expect(decideTimerIsRunning(paused)).toBe(false);
  });

  it('keeps the banked minutes across a pause and a resume', () => {
    const firstRun = pauseTimer(startTimer(undefined, NINE), NINE_FIFTEEN);

    const resumed = startTimer(firstRun, NINE_FIFTEEN);
    const secondRun = pauseTimer(resumed, TEN);

    expect(secondRun.value).toBe(60);
  });

  it('does not lose banked minutes when a paused timer is resumed and paused again at once', () => {
    const banked: HabitRecord = { completed: false, value: 30, startedAt: null };

    const resumed = startTimer(banked, NINE);

    expect(pauseTimer(resumed, NINE).value).toBe(30);
  });
});

describe('calculateTimerMinutes', () => {
  it('adds what a running timer has earned to what was already banked', () => {
    const record: HabitRecord = { completed: false, value: 20, startedAt: NINE.toISOString() };

    expect(calculateTimerMinutes(record, NINE_FIFTEEN)).toBe(35);
  });

  it('is just the banked minutes when nothing is running', () => {
    expect(calculateTimerMinutes({ completed: false, value: 20, startedAt: null }, TEN)).toBe(20);
  });

  it('is zero for an untouched habit', () => {
    expect(calculateTimerMinutes(undefined, TEN)).toBe(0);
  });
});

describe('foldRunningTimer', () => {
  it('banks what a timer left running has earned', () => {
    const running: HabitRecord = { completed: false, value: 0, startedAt: NINE.toISOString() };

    const folded = foldRunningTimer(running, TEN);

    expect(folded.value).toBe(60);
  });

  it('leaves the timer running, with its baseline moved to now', () => {
    const running: HabitRecord = { completed: false, value: 0, startedAt: NINE.toISOString() };

    const folded = foldRunningTimer(running, TEN);

    expect(decideTimerIsRunning(folded)).toBe(true);
    expect(folded.startedAt).toBe(TEN.toISOString());
  });

  it('is idempotent, so reading a day twice cannot double-count', () => {
    const running: HabitRecord = { completed: false, value: 0, startedAt: NINE.toISOString() };

    const once = foldRunningTimer(running, TEN);
    const twice = foldRunningTimer(once, TEN);

    expect(twice.value).toBe(60);
  });

  it('leaves a stopped timer exactly as it was', () => {
    const stopped: HabitRecord = { completed: false, value: 45, startedAt: null };

    expect(foldRunningTimer(stopped, TEN)).toEqual(stopped);
  });
});
