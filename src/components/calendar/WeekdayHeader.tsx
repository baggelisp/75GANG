import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type WeekdayHeaderProps = {
  labels: readonly string[];
};

/**
 * The seven column headings.
 *
 * They are what turn a run of cells into a calendar: without them a reader has to count to work
 * out which cell was a Sunday, and with them the pattern of missed days is legible at a glance.
 */
export const WeekdayHeader = ({ labels }: WeekdayHeaderProps) => {
  return (
    <View style={styles.row}>
      {labels.map((label, index) => (
        <Text key={`${label}-${index}`} style={styles.label}>
          {label}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  label: {
    ...typography.microLabel,
    flex: 1,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
