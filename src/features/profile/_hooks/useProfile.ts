import { useCallback, useEffect, useState } from 'react';

import { Achievement, collectAchievements } from '@/domain/achievements';
import { calculateCurrentDay, calculateDaysRemaining } from '@/domain/challenge';
import { collectPerfectDates } from '@/domain/history';
import { ChallengeMode } from '@/domain/modes';
import { calculateCurrentStreak, calculateLongestStreak } from '@/domain/streaks';
import { IsoDate } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const ProfileStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type ProfileStatus = (typeof ProfileStatusEnum)[keyof typeof ProfileStatusEnum];

export type ProfileView = {
  status: ProfileStatus;
  name: string | null;
  startDate: IsoDate | null;
  mode: ChallengeMode | null;
  currentDay: number;
  daysRemaining: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  achievements: readonly Achievement[];
};

const EMPTY: ProfileView = {
  status: ProfileStatusEnum.LOADING,
  name: null,
  startDate: null,
  mode: null,
  currentDay: 0,
  daysRemaining: 0,
  perfectDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  achievements: [],
};

/**
 * Who the user is and where their challenge stands.
 *
 * Every number is derived from the day records rather than read from the challenge's cached
 * counters, for the same reason the Progress screen does it: a cached streak that survived a
 * half-finished write would show the user a streak they did not earn.
 *
 * A missing profile is normal — the name is optional at onboarding — so only a failed read of the
 * challenge marks the screen unavailable.
 *
 * Badges are computed here for the same reason: a stored badge would survive a reset and claim a
 * challenge the user never finished.
 */
export const useProfile = (): ProfileView & { refresh: () => void } => {
  const repositories = useRepositories();
  const [view, setView] = useState<ProfileView>(EMPTY);

  const load = useCallback(async () => {
    const today = toLocalIsoDate(repositories.clock.now());
    const [profileResult, challengeResult, daysResult] = await Promise.all([
      repositories.profile.read(),
      repositories.challenge.read(),
      repositories.days.readAll(),
    ]);

    if (!challengeResult.ok || !daysResult.ok) {
      setView({ ...EMPTY, status: ProfileStatusEnum.UNAVAILABLE });

      return;
    }

    const name = profileResult.ok ? (profileResult.value?.name ?? null) : null;
    const challenge = challengeResult.value;

    if (challenge === null) {
      setView({ ...EMPTY, status: ProfileStatusEnum.READY, name });

      return;
    }

    const history = daysResult.value ?? {};
    const perfectDates = collectPerfectDates(history, challenge.mode);
    const currentDay = calculateCurrentDay(challenge.startDate, today);

    const longestStreak = calculateLongestStreak(perfectDates);

    setView({
      status: ProfileStatusEnum.READY,
      name,
      startDate: challenge.startDate,
      mode: challenge.mode,
      currentDay,
      daysRemaining: calculateDaysRemaining(currentDay),
      perfectDays: perfectDates.length,
      currentStreak: calculateCurrentStreak(perfectDates, today),
      longestStreak,
      achievements: collectAchievements({
        currentDay,
        perfectDays: perfectDates.length,
        longestStreak,
      }),
    });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...view, refresh: load };
};
