import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { RuleCheckbox } from './RuleCheckbox';
import { RuleRowMeta } from './RuleRowMeta';

export type RuleRowProps = {
  habitId: string;
  name: string;
  meta: string | null;
  isDone: boolean;
  isFirst: boolean;
  accessibilityLabel: string;
  onPress: (habitId: string) => void;
};

const MINIMUM_TAP_TARGET = 44;

/**
 * One rule. The whole row is the tap target — a 21pt checkbox alone is below the 44pt minimum.
 */
export const RuleRow = ({
  habitId,
  name,
  meta,
  isDone,
  isFirst,
  accessibilityLabel,
  onPress,
}: RuleRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;
  const nameStyle = isDone ? styles.nameDone : styles.name;

  const press = () => {
    onPress(habitId);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isDone }}
      accessibilityLabel={accessibilityLabel}
      onPress={press}
      style={[styles.row, dividerStyle]}
    >
      <RuleCheckbox isDone={isDone} />
      <View style={styles.text}>
        <Text style={nameStyle}>{name}</Text>
        <RuleRowMeta meta={meta} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: MINIMUM_TAP_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.ms,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.ruleRow,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  text: {
    flex: 1,
    gap: spacing.hair,
  },
  name: {
    ...typography.ruleName,
    color: colors.text,
  },
  nameDone: {
    ...typography.ruleName,
    color: colors.textSecondary,
  },
});
