import { Pressable, StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type OnboardingBarButtonProps = {
  label: string;
  align: 'left' | 'right';
  isProminent?: boolean;
  onPress: () => void;
};

const MINIMUM_TAP_TARGET = 44;

export const OnboardingBarButton = ({
  label,
  align,
  isProminent = false,
  onPress,
}: OnboardingBarButtonProps) => {
  const alignStyle = align === 'left' ? styles.alignLeft : styles.alignRight;
  const labelStyle = isProminent ? styles.labelProminent : styles.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, alignStyle]}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: MINIMUM_TAP_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  labelProminent: {
    ...typography.sectionLabel,
    color: colors.coral,
  },
});
