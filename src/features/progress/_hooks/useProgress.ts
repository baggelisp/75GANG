import { useCallback, useEffect, useState } from 'react';

import { calculateCurrentDay, calculateDaysRemaining } from '@/domain/challenge';
import { collectPerfectDates } from '@/domain/history';
import { buildProgressGrid, countPerfectDays, GridDay } from '@/domain/progressGrid';
import { calculateCurrentStreak, calculateLongestStreak } from '@/domain/streaks';
import { Challenge } from '@/domain/types';
import { collectWeightPoints, WeightPoint } from '@/domain/weightTrend';
import { settleRunningTimers } from '@/features/shared/settleTimers';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const ProgressStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  NO_CHALLENGE: 'NO_CHALLENGE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type ProgressStatus = (typeof ProgressStatusEnum)[keyof typeof ProgressStatusEnum];

export type ProgressView = {
  status: ProgressStatus;
  challenge: Challenge | null;
  currentDay: number;
  daysRemaining: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  grid: readonly GridDay[];
  weightPoints: readonly WeightPoint[];
};

const EMPTY: ProgressView = {
  status: ProgressStatusEnum.LOADING,
  challenge: null,
  currentDay: 0,
  daysRemaining: 0,
  perfectDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  grid: [],
  weightPoints: [],
};

/**
 * The whole challenge so far, derived on read.
 *
 * The grid, the counts and the streaks all come from the day records themselves, so nothing on
 * this screen can claim a day the user did not earn.
 */
export const useProgress = (): ProgressView & { refresh: () => void } => {
  const repositories = useRepositories();
  const [view, setView] = useState<ProgressView>(EMPTY);

  const load = useCallback(async () => {
    const now = repositories.clock.now();
    const today = toLocalIsoDate(now);
    const [challengeResult, daysResult] = await Promise.all([
      repositories.challenge.read(),
      repositories.days.readAll(),
    ]);

    if (!challengeResult.ok || !daysResult.ok) {
      setView({ ...EMPTY, status: ProgressStatusEnum.UNAVAILABLE });

      return;
    }

    const challenge = challengeResult.value;

    if (challenge === null) {
      setView({ ...EMPTY, status: ProgressStatusEnum.NO_CHALLENGE });

      return;
    }

    const history = await settleRunningTimers(
      repositories,
      daysResult.value ?? {},
      challenge.mode,
      now,
    );
    const grid = buildProgressGrid(challenge.startDate, today, history, challenge.mode);
    const perfectDates = collectPerfectDates(history, challenge.mode);
    const currentDay = calculateCurrentDay(challenge.startDate, today);

    setView({
      status: ProgressStatusEnum.READY,
      challenge,
      currentDay,
      daysRemaining: calculateDaysRemaining(currentDay),
      perfectDays: countPerfectDays(grid),
      currentStreak: calculateCurrentStreak(perfectDates, today),
      longestStreak: calculateLongestStreak(perfectDates),
      grid,
      weightPoints: collectWeightPoints(history),
    });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...view, refresh: load };
};
