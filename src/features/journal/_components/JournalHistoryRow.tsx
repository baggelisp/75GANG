import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type JournalHistoryRowProps = {
  date: string;
  summary: string;
  isFirst: boolean;
};

export const JournalHistoryRow = ({ date, summary, isFirst }: JournalHistoryRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.summary} numberOfLines={2}>
        {summary}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  date: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  summary: {
    ...typography.ruleName,
    color: colors.text,
  },
});
