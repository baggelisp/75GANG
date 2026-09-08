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
const DISABLED_OPACITY = 0.4;

export const PrimaryButton = ({
  label,
  accessibilityLabel,
  onPress,
  isDisabled = false,
}: PrimaryButtonProps) => {
  const stateStyle = isDisabled ? styles.disabled : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.button, stateStyle]}
    >
      <Text style={styles.label}>{label}</Text>
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
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.ink,
  },
});
