import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type CreditRowProps = {
  label: string;
  source: string;
  isFirst: boolean;
};

/** What a piece of the app came from. Read, never tapped: there is nowhere offline for it to go. */
export const CreditRow = ({ label, source, isFirst }: CreditRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.source}>{source}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: spacing.hair,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  source: {
    ...typography.ruleName,
    color: colors.text,
  },
});
