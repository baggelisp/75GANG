import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** The AntDesign glyph each tab carries. Names checked against the shipped glyph map. */
export const TabIconEnum = {
  TODAY: 'calendar',
  PROGRESS: 'bar-chart',
  JOURNAL: 'book',
  PROFILE: 'user',
} as const;

export type TabIcon = (typeof TabIconEnum)[keyof typeof TabIconEnum];

export type TabBarButtonProps = {
  label: string;
  icon: TabIcon;
  /** Injected by `TabTrigger` when used with `asChild`. */
  isFocused?: boolean;
  onPress?: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const ICON_SIZE = 16;

/**
 * The active tab is a coral pill with `ink` text, exactly as the mockup has it.
 *
 * The icon sits beside the label rather than replacing it: a glyph alone makes the user guess
 * which of four screens they are about to open, and the label is what a screen reader announces.
 */
export const TabBarButton = ({ label, icon, isFocused = false, onPress }: TabBarButtonProps) => {
  const pillStyle = isFocused ? styles.active : null;
  const labelStyle = isFocused ? styles.labelActive : styles.label;
  const iconColor = isFocused ? colors.ink : colors.textTertiary;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tab, pillStyle]}
    >
      <View style={styles.content}>
        <AntDesign name={icon} size={ICON_SIZE} color={iconColor} />
        <Text style={labelStyle}>{label}</Text>
      </View>
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
  content: {
    alignItems: 'center',
    gap: spacing.xxs,
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
