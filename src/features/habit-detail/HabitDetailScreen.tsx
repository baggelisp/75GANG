import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { decideHabitIsComplete } from '@/domain/completion';
import { findCounter } from '@/domain/counters';
import { calculateHabitProgress } from '@/domain/progress';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { describeHabitProgress } from '../today/describeHabitProgress';
import { CounterReadout } from './_components/CounterReadout';
import { CounterSteps } from './_components/CounterSteps';
import { CounterUndoButton } from './_components/CounterUndoButton';
import { HabitDetailLoading } from './_components/HabitDetailLoading';
import { HabitDetailUnavailable } from './_components/HabitDetailUnavailable';
import { HabitWriteErrorBanner } from './_components/HabitWriteErrorBanner';
import { HabitDetailStatusEnum, useHabitDetail } from './_hooks/useHabitDetail';

export type HabitDetailScreenProps = {
  habitId: string;
};

/**
 * One habit, with the controls its target type calls for.
 *
 * Only counters are built. A habit whose target type has no controls yet is told so plainly rather
 * than shown a counter it cannot use — which is what put a raw translation key where the number
 * should be, on three of the eleven rules.
 */
export const HabitDetailScreen = ({ habitId }: HabitDetailScreenProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const detail = useHabitDetail(habitId);

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
  const counter = findCounter(habit);
  const record = detail.record ?? { completed: false };

  if (counter === null) {
    return <HabitDetailUnavailable messageKey="counter.notBuiltYet" onBack={router.back} />;
  }

  const progress = calculateHabitProgress(habit, record);
  const description = describeHabitProgress(habit, record);
  const isComplete = decideHabitIsComplete(habit.id, record, detail.challenge.mode);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title}>{t(`habits.${habit.id}.name`)}</Text>
          <Text style={styles.description}>{t(`habits.${habit.id}.description`)}</Text>
        </View>

        <Card>
          <CounterReadout
            readout={t(description?.key ?? '', {
              current: progress.current,
              target: progress.target,
            })}
            isComplete={isComplete}
          />
          <View style={styles.controls}>
            <CounterSteps steps={counter.steps} onStep={detail.step} />
            <CounterUndoButton
              label={t(counter.undo.labelKey)}
              accessibilityLabel={t(counter.undo.labelKey)}
              amount={counter.undo.amount}
              onStep={detail.step}
            />
          </View>
        </Card>

        <HabitWriteErrorBanner isVisible={detail.writeFailed} onDismiss={detail.dismissError} />

        <SecondaryButton
          label={t('counter.back')}
          accessibilityLabel={t('counter.back')}
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
  controls: {
    gap: spacing.lg,
    marginTop: spacing.giant,
  },
});
