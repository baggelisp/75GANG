import { useCallback, useEffect, useState } from 'react';

import {
  calculateCurrentDay,
  calculateDaysRemaining,
  CHALLENGE_LENGTH_DAYS,
  decideIsRealChallengeDay,
} from '@/domain/challenge';
import { calculateDayCompletion } from '@/domain/completion';
import { findHabitForMode, Habit, resolveHabitsForMode } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { collectPerfectDates } from '@/domain/history';
import { calculateHabitProgress, HabitProgress } from '@/domain/progress';
import { calculateCurrentStreak, calculateLongestStreak } from '@/domain/streaks';
import { Challenge, DayCompletion, HabitRecord } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const TodayStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  NO_CHALLENGE: 'NO_CHALLENGE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type TodayStatus = (typeof TodayStatusEnum)[keyof typeof TodayStatusEnum];

export type TodayView = {
  status: TodayStatus;
  challenge: Challenge | null;
  name: string | null;
  today: string;
  currentDay: number;
  isRealChallengeDay: boolean;
  daysRemaining: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  habits: readonly Habit[];
  records: Record<string, HabitRecord>;
  completion: DayCompletion;
  workouts: HabitProgress;
  water: HabitProgress;
};

const NO_PROGRESS: HabitProgress = { current: 0, target: 0 };

const EMPTY_COMPLETION: DayCompletion = {
  completedHabits: 0,
  totalHabits: 0,
  completionPercentage: 0,
  perfectDay: false,
};

const readProgress = (
  habitId: string,
  mode: Challenge['mode'],
  records: Record<string, HabitRecord>,
): HabitProgress => {
  const habit = findHabitForMode(habitId, mode);

  if (habit === null) {
    return NO_PROGRESS;
  }

  return calculateHabitProgress(habit, records[habitId]);
};

/**
 * Everything the Today screen shows, derived on every read.
 *
 * Nothing here is taken from a stored duplicate: the day number comes from the start date, the
 * counts from the habit records, and the streaks from days recomputed against the challenge's own
 * rules. A read that fails reports UNAVAILABLE rather than an empty history — telling a day-60
 * user their streak is zero is the worst lie this screen can tell.
 */
export const useToday = (): TodayView & { refresh: () => void } => {
  const repositories = useRepositories();
  const [view, setView] = useState<TodayView>({
    status: TodayStatusEnum.LOADING,
    challenge: null,
    name: null,
    today: toLocalIsoDate(repositories.clock.now()),
    currentDay: 0,
    isRealChallengeDay: false,
    daysRemaining: CHALLENGE_LENGTH_DAYS,
    perfectDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    habits: [],
    records: {},
    completion: EMPTY_COMPLETION,
    workouts: NO_PROGRESS,
    water: NO_PROGRESS,
  });

  const load = useCallback(async () => {
    const today = toLocalIsoDate(repositories.clock.now());
    const [challengeResult, profileResult, daysResult] = await Promise.all([
      repositories.challenge.read(),
      repositories.profile.read(),
      repositories.days.readAll(),
    ]);

    if (!challengeResult.ok || !daysResult.ok) {
      setView((current) => ({ ...current, status: TodayStatusEnum.UNAVAILABLE, today }));

      return;
    }

    const challenge = challengeResult.value;

    if (challenge === null) {
      setView((current) => ({ ...current, status: TodayStatusEnum.NO_CHALLENGE, today }));

      return;
    }

    const history = daysResult.value ?? {};
    const records = history[today]?.habits ?? {};
    const currentDay = calculateCurrentDay(challenge.startDate, today);
    const perfectDates = collectPerfectDates(history, challenge.mode);

    setView({
      status: TodayStatusEnum.READY,
      challenge,
      name: profileResult.ok ? (profileResult.value?.name ?? null) : null,
      today,
      currentDay,
      isRealChallengeDay: decideIsRealChallengeDay(currentDay),
      daysRemaining: calculateDaysRemaining(currentDay),
      perfectDays: perfectDates.length,
      currentStreak: calculateCurrentStreak(perfectDates, today),
      longestStreak: calculateLongestStreak(perfectDates),
      habits: resolveHabitsForMode(challenge.mode),
      records,
      completion: calculateDayCompletion(records, challenge.mode),
      workouts: readProgress(HabitIdEnum.WORKOUTS, challenge.mode, records),
      water: readProgress(HabitIdEnum.WATER, challenge.mode, records),
    });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...view, refresh: load };
};
