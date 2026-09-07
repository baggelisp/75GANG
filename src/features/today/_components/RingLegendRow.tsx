import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { Accent, colors, resolveAccentColor } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type RingLegendRowProps = {
  label: string;
  accent: Accent;
  value: string;
  unit: string;
  fraction: string;
};

export const RingLegendRow = ({ label, accent, value, unit, fraction }: RingLegendRowProps) => {
  const labelStyle = { color: resolveAccentColor(accent) };

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <Text style={styles.fraction}>{fraction}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  left: {
    flex: 1,
    gap: spacing.hair,
  },
  label: {
    ...typography.microLabel,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xxs,
  },
  value: {
    ...typography.legendValue,
    color: colors.text,
  },
  unit: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  fraction: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
