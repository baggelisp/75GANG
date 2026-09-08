import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { CounterCompleteLabel } from './CounterCompleteLabel';

export type TimerReadoutProps = {
  elapsed: string;
  target: string;
  isComplete: boolean;
};

export const TimerReadout = ({ elapsed, target, isComplete }: TimerReadoutProps) => {
  const elapsedStyle = isComplete ? styles.elapsedComplete : styles.elapsed;

  return (
    <View style={styles.readout}>
      <Text style={elapsedStyle}>{elapsed}</Text>
      <Text style={styles.target}>{target}</Text>
      <CounterCompleteLabel isComplete={isComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  readout: {
    gap: spacing.xs,
  },
  elapsed: {
    ...typography.hero,
    color: colors.text,
  },
  elapsedComplete: {
    ...typography.hero,
    color: colors.coral,
  },
  target: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
