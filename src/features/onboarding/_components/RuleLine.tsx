import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type RuleLineProps = {
  number: number;
  name: string;
};

export const RuleLine = ({ number, name }: RuleLineProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  number: {
    ...typography.microLabel,
    color: colors.textTertiary,
    minWidth: 16,
  },
  name: {
    ...typography.ruleName,
    color: colors.text,
    flex: 1,
  },
});
