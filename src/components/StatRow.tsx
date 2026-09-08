import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** A label with its number, the row both Progress and Profile use to list challenge stats. */
export type StatRowProps = {
  label: string;
  value: string;
  isFirst: boolean;
};

export const StatRow = ({ label, value, isFirst }: StatRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  },
  value: {
    ...typography.legendValue,
    color: colors.text,
  },
});
