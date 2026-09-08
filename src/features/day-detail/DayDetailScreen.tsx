import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { PeriodStepper } from '@/components/calendar/PeriodStepper';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { addCalendarDays } from '@/domain/calendar';
import { calculateCurrentDay, CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { calculateDayCompletion, decideHabitIsComplete } from '@/domain/completion';
import { describeHabitTargets, resolveHabitsForMode } from '@/domain/habits';
import { useTranslation } from '@/i18n';
import { useRepositories } from '@/storage/repositoryContext';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { formatLongDateWithYear, toLocalIsoDate } from '@/utils/DateUtility';

import { DayDetailLoading } from './_components/DayDetailLoading';
import { DayRuleRow } from './_components/DayRuleRow';
import { useDayDetail } from './_hooks/useDayDetail';

const ONE_DAY = 1;

export type DayDetailScreenProps = {
  date: string;
};

/** A past day, read only. Looking back at a day never changes it. */
export const DayDetailScreen = ({ date }: DayDetailScreenProps) => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const repositories = useRepositories();
  const detail = useDayDetail(date);
  const today = toLocalIsoDate(repositories.clock.now());

  if (detail.isLoading || detail.challenge === null) {
    return <DayDetailLoading />;
  }

  const mode = detail.challenge.mode;
  const habits = resolveHabitsForMode(mode);
  const records = detail.record?.habits ?? {};
  const completion = calculateDayCompletion(records, mode);
  const currentDay = calculateCurrentDay(detail.challenge.startDate, date);
  const previousDay = addCalendarDays(date, -ONE_DAY);
  const nextDay = addCalendarDays(date, ONE_DAY);

  const openDay = (target: string | null) => {
    if (target === null) {
      return;
    }

    router.replace(`/day/${target}`);
  };

  const goToPreviousDay = () => openDay(previousDay);
  const goToNextDay = () => openDay(nextDay);

  const canGoBack = previousDay !== null && previousDay >= detail.challenge.startDate;
  const canGoForward = nextDay !== null && nextDay <= today;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.kicker}>
            {t('day.dayOfChallenge', { day: currentDay, total: CHALLENGE_LENGTH_DAYS })}
          </Text>
          <Text style={styles.title}>{formatLongDateWithYear(date, locale)}</Text>
        </View>

        {/* Reading back over a week means walking through it. Going out to the calendar and in
            again for every day is the kind of friction that stops anyone looking at all. The
            score sits between the arrows rather than on a line of its own: it is what changes as
            you step, and the heading above already says which day this is. */}
        <PeriodStepper
          title={t('day.score', {
            done: completion.completedHabits,
            total: completion.totalHabits,
          })}
          backLabel={t('day.previousDay')}
          forwardLabel={t('day.nextDay')}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={goToPreviousDay}
          onForward={goToNextDay}
        />

        <Card>
          {habits.map((habit, index) => (
            <DayRuleRow
              key={habit.id}
              name={t(`habits.${habit.id}.name`, describeHabitTargets(habit))}
              isDone={decideHabitIsComplete(
                habit.id,
                records[habit.id] ?? { completed: false },
                mode,
              )}
              isFirst={index === 0}
            />
          ))}
        </Card>

        <BackButton
          label={t('counter.back')}
          accessibilityLabel={t('day.backAccessibility')}
          onPress={router.back}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.giant,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
  heading: {
    gap: spacing.xs,
  },
  kicker: {
    ...typography.kicker,
    color: colors.textSecondary,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
});
