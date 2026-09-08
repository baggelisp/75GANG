import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type DetoxWindowRowProps = {
  label: string;
  reading: string;
  isDone: boolean;
  isFirst: boolean;
};

export const DetoxWindowRow = ({ label, reading, isDone, isFirst }: DetoxWindowRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;
  const readingStyle = isDone ? styles.readingDone : styles.reading;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={readingStyle}>{reading}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
    flex: 1,
  },
  reading: {
    ...typography.legendValue,
    color: colors.text,
  },
  readingDone: {
    ...typography.legendValue,
    color: colors.coral,
  },
});
