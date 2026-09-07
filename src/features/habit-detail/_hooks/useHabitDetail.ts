import { useCallback, useEffect, useState } from 'react';

import { applyCounterStep, findCounter } from '@/domain/counters';
import { pauseTimer, startTimer } from '@/domain/timers';
import {
  finishWorkout,
  recordWorkoutManually,
  removeLastWorkout,
  startWorkout,
} from '@/domain/workouts';
import { applyHabitChange } from '@/domain/dayRecord';
import { findHabitForMode, Habit } from '@/domain/habits';
import { Challenge, DayRecord, HabitRecord } from '@/domain/types';
import { settleRunningTimers } from '@/features/shared/settleTimers';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const HabitDetailStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  UNAVAILABLE: 'UNAVAILABLE',
  NOT_IN_CHALLENGE: 'NOT_IN_CHALLENGE',
} as const;

export type HabitDetailStatus = (typeof HabitDetailStatusEnum)[keyof typeof HabitDetailStatusEnum];

export type HabitDetailView = {
  status: HabitDetailStatus;
  habit: Habit | null;
  challenge: Challenge | null;
  record: HabitRecord | null;
  writeFailed: boolean;
};

/**
 * One habit's detail, and the steps that change it.
 *
 * Every step resolves its value and its date inside the write, from the record being written and
 * the clock at that moment — the same rule the Today screen's toggle follows, and for the same
 * reason: taking either from React state loses a rapid second tap and misfiles a tap made across
 * midnight.
 */
export const useHabitDetail = (habitId: string) => {
  const repositories = useRepositories();
  const [view, setView] = useState<HabitDetailView>({
    status: HabitDetailStatusEnum.LOADING,
    habit: null,
    challenge: null,
    record: null,
    writeFailed: false,
  });

  const load = useCallback(async () => {
    const now = repositories.clock.now();
    const today = toLocalIsoDate(now);
    const [challengeResult, daysResult] = await Promise.all([
      repositories.challenge.read(),
      repositories.days.readAll(),
    ]);

    if (!challengeResult.ok || !daysResult.ok || challengeResult.value === null) {
      setView((current) => ({ ...current, status: HabitDetailStatusEnum.UNAVAILABLE }));

      return;
    }

    const challenge = challengeResult.value;
    const habit = findHabitForMode(habitId, challenge.mode);

    if (habit === null) {
      setView((current) => ({ ...current, status: HabitDetailStatusEnum.NOT_IN_CHALLENGE }));

      return;
    }

    const history = await settleRunningTimers(
      repositories,
      daysResult.value ?? {},
      challenge.mode,
      now,
    );

    setView({
      status: HabitDetailStatusEnum.READY,
      habit,
      challenge,
      record: history[today]?.habits[habitId] ?? null,
      writeFailed: false,
    });
  }, [habitId, repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const writeRecord = async (
    build: (current: HabitRecord | undefined, now: Date) => HabitRecord,
  ): Promise<boolean> => {
    const challenge = view.challenge;

    if (challenge === null) {
      return false;
    }

    const now = repositories.clock.now();
    const date = toLocalIsoDate(now);
    const updatedAt = now.toISOString();

    const written = await repositories.days
      .update(date, (current: DayRecord | null) =>
        applyHabitChange(
          current,
          { habitId, record: build(current?.habits[habitId], now) },
          challenge.mode,
          updatedAt,
        ),
      )
      .catch(() => ({ ok: false }) as const);

    if (!written.ok) {
      setView((current) => ({ ...current, writeFailed: true }));

      return false;
    }

    setView((current) => ({
      ...current,
      record: written.value.habits[habitId] ?? null,
      writeFailed: false,
    }));

    return true;
  };

  const step = (amount: number): Promise<boolean> => {
    const habit = view.habit;
    const counter = habit === null ? null : findCounter(habit);

    if (counter === null) {
      return Promise.resolve(false);
    }

    return writeRecord((current) => applyCounterStep(current, amount, counter.precision));
  };

  const start = (): Promise<boolean> => writeRecord((current, now) => startTimer(current, now));

  const pause = (): Promise<boolean> => writeRecord((current, now) => pauseTimer(current, now));

  const beginWorkout = (isOutdoor: boolean): Promise<boolean> =>
    writeRecord((current, now) => startWorkout(current, now, isOutdoor));

  const endWorkout = (): Promise<boolean> =>
    writeRecord((current, now) => finishWorkout(current, now));

  const addWorkoutByHand = (minutes: number, isOutdoor: boolean): Promise<boolean> =>
    writeRecord((current, now) => recordWorkoutManually(current, minutes, isOutdoor, now));

  const undoLastWorkout = (): Promise<boolean> =>
    writeRecord((current) => removeLastWorkout(current));

  const dismissError = () => {
    setView((current) => ({ ...current, writeFailed: false }));
  };

  return {
    ...view,
    step,
    start,
    pause,
    beginWorkout,
    endWorkout,
    addWorkoutByHand,
    undoLastWorkout,
    dismissError,
    refresh: load,
  };
};
