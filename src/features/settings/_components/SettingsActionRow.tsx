import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SettingsActionRowProps = {
  label: string;
  hint: string;
  isFirst: boolean;
  isDisabled: boolean;
  isDestructive: boolean;
  onPress: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const DISABLED_OPACITY = 0.4;

/**
 * A row that does something rather than holding a value.
 *
 * A destructive one is coral, and it still only opens a confirmation — it never acts on the tap
 * itself, which is why it can sit in the same list as everything else without being dressed as an
 * alarm.
 */
export const SettingsActionRow = ({
  label,
  hint,
  isFirst,
  isDisabled,
  isDestructive,
  onPress,
}: SettingsActionRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;
  const disabledStyle = isDisabled ? styles.disabled : null;
  const labelStyle = isDestructive ? styles.destructiveLabel : styles.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.row, dividerStyle, disabledStyle]}
    >
      <View style={styles.text}>
        <Text style={labelStyle}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: MINIMUM_TAP_TARGET,
    justifyContent: 'center',
    borderRadius: radii.ruleRow,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  text: {
    gap: spacing.xxs,
  },
  label: {
    ...typography.ruleName,
    color: colors.text,
  },
  destructiveLabel: {
    ...typography.ruleName,
    color: colors.coral,
  },
  hint: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});
