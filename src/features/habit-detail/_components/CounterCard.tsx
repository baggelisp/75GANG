import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { CounterDefinition } from '@/domain/counters';
import { Habit } from '@/domain/habits';
import { calculateHabitProgress } from '@/domain/progress';
import { HabitRecord } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { describeHabitProgress } from '../../today/describeHabitProgress';
import { CounterReadout } from './CounterReadout';
import { CounterSteps } from './CounterSteps';
import { CounterUndoButton } from './CounterUndoButton';

export type CounterCardProps = {
  habit: Habit;
  counter: CounterDefinition;
  record: HabitRecord;
  isComplete: boolean;
  onStep: (amount: number) => void;
};

export const CounterCard = ({ habit, counter, record, isComplete, onStep }: CounterCardProps) => {
  const { t } = useTranslation();
  const progress = calculateHabitProgress(habit, record);
  const description = describeHabitProgress(habit, record);

  return (
    <Card>
      <CounterReadout
        readout={t(description?.key ?? '', {
          current: progress.current,
          target: progress.target,
        })}
        isComplete={isComplete}
      />
      <View style={styles.controls}>
        <CounterSteps steps={counter.steps} onStep={onStep} />
        <CounterUndoButton
          label={t(counter.undo.labelKey)}
          accessibilityLabel={t(counter.undo.labelKey)}
          amount={counter.undo.amount}
          onStep={onStep}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  controls: {
    gap: spacing.lg,
    marginTop: spacing.giant,
  },
});
