import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type SecondaryButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

const MINIMUM_TAP_TARGET = 44;

export const SecondaryButton = ({ label, accessibilityLabel, onPress }: SecondaryButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.button}
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
    backgroundColor: colors.raised,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.massive,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
