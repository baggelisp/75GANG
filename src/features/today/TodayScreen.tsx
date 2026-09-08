import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { TargetTypeEnum } from '@/domain/targets';
import { useReminderSync } from '@/features/shared/useReminderSync';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { formatLongDate } from '@/utils/DateUtility';

import { ChallengeCard } from './_components/ChallengeCard';
import { PerfectDayCelebration } from './_components/PerfectDayCelebration';
import { RuleList } from './_components/RuleList';
import { TodayHeader } from './_components/TodayHeader';
import { TodayLoading } from './_components/TodayLoading';
import { TodayRingsCard } from './_components/TodayRingsCard';
import { TodayTiles } from './_components/TodayTiles';
import { TodayUnavailable } from './_components/TodayUnavailable';
import { WriteErrorBanner } from './_components/WriteErrorBanner';
import { useHabitToggle } from './_hooks/useHabitToggle';
import { usePerfectDayCelebration } from './_hooks/usePerfectDayCelebration';
import { TodayStatusEnum, useToday } from './_hooks/useToday';
import { decideChallengeMode } from './decideChallengeMode';

/**
 * The home screen. Everything on it is derived on read — the day number from the start date, the
 * counts and streaks from the habit records — so nothing displayed can disagree with what the
 * user actually recorded.
 */
export const TodayScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const today = useToday();
  const { toggleHabit, writeFailed, dismissError } = useHabitToggle({
    mode: decideChallengeMode(today.challenge),
    onWritten: today.refresh,
  });
  const reminders = useReminderSync();
  const celebration = usePerfectDayCelebration({
    date: today.today,
    completedHabits: today.completion.completedHabits,
    totalHabits: today.completion.totalHabits,
  });

  // The evening reminder carries the live count, so it is rebuilt whenever the count moves. The
  // status is deliberately ignored here: a reminder that could not be rescheduled must never
  // interrupt someone recording a habit.
  const syncReminders = reminders.sync;
  const completedHabits = today.completion.completedHabits;

  useEffect(() => {
    void syncReminders();
  }, [syncReminders, completedHabits, today.status]);

  if (today.status === TodayStatusEnum.LOADING) {
    return <TodayLoading />;
  }

  if (today.status !== TodayStatusEnum.READY || today.challenge === null) {
    return <TodayUnavailable onRetry={today.refresh} />;
  }

  const greeting =
    today.name === null ? t('today.greetingAnonymous') : t('today.greeting', { name: today.name });

  const kicker = today.isRealChallengeDay
    ? t('today.dayKicker', {
        date: formatLongDate(today.today, locale),
        day: today.currentDay,
        total: CHALLENGE_LENGTH_DAYS,
      })
    : t('today.dayKickerOutsideChallenge', { date: formatLongDate(today.today, locale) });

  const pressRule = (habitId: string) => {
    const habit = today.habits.find((candidate) => candidate.id === habitId);

    if (habit === undefined) {
      return;
    }

    if (habit.targetType === TargetTypeEnum.BOOLEAN) {
      void toggleHabit(habitId);

      return;
    }

    router.push(`/habit/${habitId}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayHeader kicker={kicker} greeting={greeting} name={today.name} />

        <TodayRingsCard
          habitsCompleted={today.completion.completedHabits}
          habitsTarget={today.completion.totalHabits}
          workoutsCompleted={today.workouts.current}
          workoutsTarget={today.workouts.target}
          waterLitres={today.water.current}
          waterTargetLitres={today.water.target}
          percentComplete={today.completion.completionPercentage}
        />

        <TodayTiles
          currentStreak={today.currentStreak}
          longestStreak={today.longestStreak}
          completedHabits={today.completion.completedHabits}
          totalHabits={today.completion.totalHabits}
        />

        <WriteErrorBanner isVisible={writeFailed} onDismiss={dismissError} />

        <ChallengeCard perfectDays={today.perfectDays} daysRemaining={today.daysRemaining} />

        <RuleList
          habits={today.habits}
          records={today.records}
          mode={today.challenge.mode}
          completedHabits={today.completion.completedHabits}
          onPressRule={pressRule}
        />
      </ScrollView>

      <PerfectDayCelebration
        isShowing={celebration.isShowing}
        prefersReducedMotion={celebration.prefersReducedMotion}
        day={today.currentDay}
        totalHabits={today.completion.totalHabits}
        onDismiss={celebration.dismiss}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.massive,
  },
});
