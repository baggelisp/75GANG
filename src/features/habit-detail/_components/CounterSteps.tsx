import { StyleSheet, View } from 'react-native';

import { CounterStep } from '@/domain/counters';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { CounterStepButton } from './CounterStepButton';

export type CounterStepsProps = {
  steps: readonly CounterStep[];
  onStep: (amount: number) => void;
};

export const CounterSteps = ({ steps, onStep }: CounterStepsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.steps}>
      {steps.map((step) => (
        <CounterStepButton
          key={step.labelKey}
          label={t(step.labelKey)}
          amount={step.amount}
          onStep={onStep}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
