import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { BackButton } from '@/components/BackButton';
import { decideHabitIsComplete } from '@/domain/completion';
import { decideHabitNameKey, describeHabitTargets } from '@/domain/habits';
import { decideIsMarkedDone } from '@/domain/markDone';
import { decideTimerIsRunning } from '@/domain/timers';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { HabitTracker } from './_components/HabitTracker';
import { HabitDetailLoading } from './_components/HabitDetailLoading';
import { HabitDetailUnavailable } from './_components/HabitDetailUnavailable';
import { HabitWriteErrorBanner } from './_components/HabitWriteErrorBanner';
import { MarkDoneCard } from './_components/MarkDoneCard';
import { HabitDetailStatusEnum, useHabitDetail } from './_hooks/useHabitDetail';
import { useWeighIn } from './_hooks/useWeighIn';
import { decideTracker, TrackerEnum } from './decideTracker';

export type HabitDetailScreenProps = {
  habitId: string;
};

/**
 * One habit, with the controls its target type calls for: a counter, a timer, or the two workout
 * sessions. A habit whose tracker is not built yet is told so plainly rather than shown controls
 * it cannot use.
 */
export const HabitDetailScreen = ({ habitId }: HabitDetailScreenProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const detail = useHabitDetail(habitId);
  const [chosenOutdoor, setChosenOutdoor] = useState(false);
  const weighIn = useWeighIn(detail);

  if (detail.status === HabitDetailStatusEnum.LOADING) {
    return <HabitDetailLoading />;
  }

  if (
    detail.status !== HabitDetailStatusEnum.READY ||
    detail.habit === null ||
    detail.challenge === null
  ) {
    return <HabitDetailUnavailable messageKey="counter.unavailable" onBack={router.back} />;
  }

  const habit = detail.habit;
  const record = detail.record ?? { completed: false };
  const tracker = decideTracker(habit);
  const isComplete = decideHabitIsComplete(habit.id, record, detail.challenge.mode);

  if (tracker === TrackerEnum.NOT_BUILT_YET) {
    return <HabitDetailUnavailable messageKey="counter.notBuiltYet" onBack={router.back} />;
  }

  // While a workout is running, what was chosen when it started is the truth — reading it back
  // from the record means a force-quit mid-workout cannot leave the toggle lying about it.
  const isOutdoor = decideTimerIsRunning(record) ? (record.outdoor ?? false) : chosenOutdoor;

  const toggleOutdoor = () => {
    setChosenOutdoor(!chosenOutdoor);
  };

  const startWorkoutNow = () => {
    void detail.beginWorkout(isOutdoor);
  };

  const recordByHand = () => {
    void detail.addWorkoutByHand(habit.sessionMinutes ?? 0, isOutdoor);
  };

  const markByHand = () => {
    void detail.markByHand();
  };

  const unmarkByHand = () => {
    void detail.unmarkByHand();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title}>
            {t(decideHabitNameKey(habit), describeHabitTargets(habit))}
          </Text>
          <Text style={styles.description}>
            {t(`habits.${habit.id}.description`, describeHabitTargets(habit))}
          </Text>
        </View>

        <HabitTracker
          tracker={tracker}
          weighIn={weighIn}
          habit={habit}
          record={record}
          isComplete={isComplete}
          isOutdoor={isOutdoor}
          onStep={detail.step}
          onStart={detail.start}
          onPause={detail.pause}
          onStartWorkout={startWorkoutNow}
          onFinishWorkout={detail.endWorkout}
          onToggleOutdoor={toggleOutdoor}
          onRecordByHand={recordByHand}
          onUndoLast={detail.undoLastWorkout}
          onWakeUp={detail.wakeUp}
          onClearWakeUp={detail.clearWokeUp}
        />

        <MarkDoneCard
          isMarkedDone={decideIsMarkedDone(record)}
          onMark={markByHand}
          onUnmark={unmarkByHand}
        />

        <HabitWriteErrorBanner isVisible={detail.writeFailed} onDismiss={detail.dismissError} />

        <BackButton
          label={t('counter.back')}
          accessibilityLabel={t('counter.backAccessibility')}
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
    gap: spacing.sm,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  description: {
    ...typography.ruleName,
    color: colors.textSecondary,
  },
});
