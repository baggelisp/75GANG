import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { spacing } from '@/theme/spacing';

import { ProgressEmpty } from './_components/ProgressEmpty';
import { ProgressCalendar } from './_components/ProgressCalendar';
import { ProgressLoading } from './_components/ProgressLoading';
import { ProgressStats } from './_components/ProgressStats';
import { WeightTrendCard } from './_components/WeightTrendCard';
import { ProgressStatusEnum, useProgress } from './_hooks/useProgress';

/** The whole challenge: the numbers, the seventy-five day grid, and the weight trend. */
export const ProgressScreen = () => {
  const router = useRouter();
  const progress = useProgress();

  if (progress.status === ProgressStatusEnum.LOADING) {
    return <ProgressLoading />;
  }

  if (progress.status !== ProgressStatusEnum.READY || progress.challenge === null) {
    return <ProgressEmpty messageKey="progress.unavailable" onRetry={progress.refresh} />;
  }

  const openDay = (dayNumber: number) => {
    const day = progress.grid[dayNumber - 1];

    if (day === undefined) {
      return;
    }

    router.push(`/day/${day.date}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressStats
          currentDay={progress.currentDay}
          daysRemaining={progress.daysRemaining}
          perfectDays={progress.perfectDays}
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />
        <ProgressCalendar grid={progress.grid} onPressDay={openDay} />
        <WeightTrendCard points={progress.weightPoints} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
});
