import { ChallengeMode } from '@/domain/modes';
import { calculateDayCompletion } from '@/domain/completion';
import { decideDayHasRunningTimer, settleDayTimers } from '@/domain/timers';
import { DayRecordsByDate, IsoDate } from '@/domain/types';
import { Repositories } from '@/storage/repositories/buildRepositories';
import { endOfLocalDay, toLocalIsoDate } from '@/utils/DateUtility';

/**
 * Banks every running timer across the whole history, then persists the days that changed.
 *
 * Run whenever a day is read, because a running timer is worth nothing to completion, the perfect
 * day or the streak until its minutes are banked. Doing it only for today, only on one screen,
 * meant a timer started at 23:50 lost the day outright and a timer still running at bedtime never
 * counted at all.
 *
 * A past day is settled against its own last instant, so an overnight timer is worth the hours it
 * ran rather than every hour until the app was next opened.
 */
export const settleRunningTimers = async (
  repositories: Repositories,
  history: DayRecordsByDate,
  mode: ChallengeMode,
  now: Date,
): Promise<DayRecordsByDate> => {
  const today = toLocalIsoDate(now);
  const settled: DayRecordsByDate = { ...history };

  const dates = Object.keys(history).filter((date) =>
    decideDayHasRunningTimer(history[date]?.habits ?? {}),
  );

  await Promise.all(
    dates.map(async (date) => {
      const day = history[date];

      if (day === undefined) {
        return;
      }

      const asOf = decideAsOf(date, today, now);
      const habits = settleDayTimers(day.habits, asOf);
      const completion = calculateDayCompletion(habits, mode);
      const banked = {
        ...day,
        habits,
        completedHabits: completion.completedHabits,
        totalHabits: completion.totalHabits,
        completionPercentage: completion.completionPercentage,
        perfectDay: completion.perfectDay,
        updatedAt: now.toISOString(),
      };

      settled[date] = banked;

      await repositories.days.update(date, () => banked).catch(() => undefined);
    }),
  );

  return settled;
};

const decideAsOf = (date: IsoDate, today: IsoDate, now: Date): Date => {
  if (date === today) {
    return now;
  }

  const endOfThatDay = endOfLocalDay(date);

  return endOfThatDay.getTime() < now.getTime() ? endOfThatDay : now;
};
