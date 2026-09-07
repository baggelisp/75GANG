import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { CounterCompleteLabel } from './CounterCompleteLabel';

export type CounterReadoutProps = {
  readout: string;
  isComplete: boolean;
};

export const CounterReadout = ({ readout, isComplete }: CounterReadoutProps) => {
  const valueStyle = isComplete ? styles.valueComplete : styles.value;

  return (
    <View style={styles.readout}>
      <Text style={valueStyle}>{readout}</Text>
      <CounterCompleteLabel isComplete={isComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  readout: {
    gap: spacing.sm,
  },
  value: {
    ...typography.hero,
    color: colors.text,
  },
  valueComplete: {
    ...typography.hero,
    color: colors.coral,
  },
});
