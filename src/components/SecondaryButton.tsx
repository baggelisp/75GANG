import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type SecondaryButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  isDisabled?: boolean;
};

const MINIMUM_TAP_TARGET = 44;
const DISABLED_OPACITY = 0.4;

export const SecondaryButton = ({
  label,
  accessibilityLabel,
  onPress,
  isDisabled = false,
}: SecondaryButtonProps) => {
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
  /**
   * The outline is not decoration: on a `raised` surface — a confirmation dialog, say — a button
   * filled with `raised` disappears into it and reads as a line of text.
   */
  button: {
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.raised,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.massive,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
