import { useCallback, useEffect, useState } from 'react';

import { applyCounterStep, findCounter } from '@/domain/counters';
import { applyHabitChange } from '@/domain/dayRecord';
import { findHabitForMode, Habit } from '@/domain/habits';
import { Challenge, DayRecord, HabitRecord } from '@/domain/types';
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
    const today = toLocalIsoDate(repositories.clock.now());
    const [challengeResult, dayResult] = await Promise.all([
      repositories.challenge.read(),
      repositories.days.readOne(today),
    ]);

    if (!challengeResult.ok || !dayResult.ok || challengeResult.value === null) {
      setView((current) => ({ ...current, status: HabitDetailStatusEnum.UNAVAILABLE }));

      return;
    }

    const challenge = challengeResult.value;
    const habit = findHabitForMode(habitId, challenge.mode);

    if (habit === null) {
      setView((current) => ({ ...current, status: HabitDetailStatusEnum.NOT_IN_CHALLENGE }));

      return;
    }

    setView({
      status: HabitDetailStatusEnum.READY,
      habit,
      challenge,
      record: dayResult.value?.habits[habitId] ?? null,
      writeFailed: false,
    });
  }, [habitId, repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const step = async (amount: number): Promise<boolean> => {
    const challenge = view.challenge;
    const habit = view.habit;
    const counter = habit === null ? null : findCounter(habit);

    if (challenge === null || counter === null) {
      return false;
    }

    const now = repositories.clock.now();
    const date = toLocalIsoDate(now);
    const updatedAt = now.toISOString();

    const written = await repositories.days
      .update(date, (current: DayRecord | null) =>
        applyHabitChange(
          current,
          {
            habitId,
            record: applyCounterStep(current?.habits[habitId], amount, counter.precision),
          },
          challenge.mode,
          updatedAt,
        ),
      )
      .catch(() => ({ ok: false }) as const);

    if (!written.ok) {
      setView((current) => ({ ...current, writeFailed: true }));

      return false;
    }

    // Taken from the write's own result rather than re-read. Two reads racing have no ordering
    // guarantee, and a stale one winning would leave the screen showing less than was saved.
    setView((current) => ({
      ...current,
      record: written.value.habits[habitId] ?? null,
      writeFailed: false,
    }));

    return true;
  };

  const dismissError = () => {
    setView((current) => ({ ...current, writeFailed: false }));
  };

  return { ...view, step, dismissError, refresh: load };
};
