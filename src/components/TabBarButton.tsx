import { Pressable, StyleSheet, Text } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type TabBarButtonProps = {
  label: string;
  /** Injected by `TabTrigger` when used with `asChild`. */
  isFocused?: boolean;
  onPress?: () => void;
};

const MINIMUM_TAP_TARGET = 44;

/** The active tab is a coral pill with `ink` text, exactly as the mockup has it. */
export const TabBarButton = ({ label, isFocused = false, onPress }: TabBarButtonProps) => {
  const pillStyle = isFocused ? styles.active : null;
  const labelStyle = isFocused ? styles.labelActive : styles.label;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tab, pillStyle]}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
  },
  active: {
    backgroundColor: colors.coral,
  },
  label: {
    ...typography.tabLabel,
    color: colors.textTertiary,
  },
  labelActive: {
    ...typography.tabLabel,
    color: colors.ink,
  },
});
