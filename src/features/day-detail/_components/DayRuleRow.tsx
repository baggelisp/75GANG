import { StyleSheet, Text, View } from 'react-native';

import { RuleCheckbox } from '@/features/today/_components/RuleCheckbox';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type DayRuleRowProps = {
  name: string;
  isDone: boolean;
  isFirst: boolean;
};

/** Read only: the box shows what happened, and cannot be tapped to change it. */
export const DayRuleRow = ({ name, isDone, isFirst }: DayRuleRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;
  const nameStyle = isDone ? styles.nameDone : styles.name;

  return (
    <View style={[styles.row, dividerStyle]}>
      <RuleCheckbox isDone={isDone} />
      <Text style={nameStyle}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.ms,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  name: {
    ...typography.ruleName,
    color: colors.text,
    flex: 1,
  },
  nameDone: {
    ...typography.ruleName,
    color: colors.textSecondary,
    flex: 1,
  },
});
