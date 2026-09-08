import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type PrimaryButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  isDisabled?: boolean;
};

const MINIMUM_TAP_TARGET = 44;

export const PrimaryButton = ({
  label,
  accessibilityLabel,
  onPress,
  isDisabled = false,
}: PrimaryButtonProps) => {
  const stateStyle = isDisabled ? styles.disabled : null;
  const labelStyle = isDisabled ? styles.disabledLabel : styles.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.button, stateStyle]}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.massive,
  },
  /**
   * A disabled button is a surface, not a faded coral one. Coral at 40% composites to a muddy
   * red with `ink` text on top of it — unreadable, and it reads as broken rather than as not yet.
   */
  disabled: {
    backgroundColor: colors.raised,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.ink,
  },
  disabledLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
  },
});
