import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { TargetTypeEnum } from '@/domain/targets';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { formatLongDate } from '@/utils/DateUtility';

import { ChallengeCard } from './_components/ChallengeCard';
import { RuleList } from './_components/RuleList';
import { TodayHeader } from './_components/TodayHeader';
import { TodayLoading } from './_components/TodayLoading';
import { TodayRingsCard } from './_components/TodayRingsCard';
import { TodayTiles } from './_components/TodayTiles';
import { TodayUnavailable } from './_components/TodayUnavailable';
import { TodayStatusEnum, useToday } from './_hooks/useToday';
import { decideAvatarInitial } from './decideAvatarInitial';

/**
 * The home screen. Everything on it is derived on read — the day number from the start date, the
 * counts and streaks from the habit records — so nothing displayed can disagree with what the
 * user actually recorded.
 */
export const TodayScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const today = useToday();

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

  const openRule = (habitId: string) => {
    const habit = today.habits.find((candidate) => candidate.id === habitId);

    if (habit === undefined || habit.targetType === TargetTypeEnum.BOOLEAN) {
      return;
    }

    router.push(`/habit/${habitId}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayHeader
          kicker={kicker}
          greeting={greeting}
          initial={decideAvatarInitial(today.name)}
        />

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

        <ChallengeCard perfectDays={today.perfectDays} daysRemaining={today.daysRemaining} />

        <RuleList
          habits={today.habits}
          records={today.records}
          mode={today.challenge.mode}
          completedHabits={today.completion.completedHabits}
          onPressRule={openRule}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.massive,
  },
});
