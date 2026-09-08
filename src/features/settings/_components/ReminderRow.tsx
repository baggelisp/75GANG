import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ReminderRowProps = {
  label: string;
  time: string;
  isDisabled: boolean;
  isFirst: boolean;
  onEarlier: () => void;
  onLater: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const DISABLED_OPACITY = 0.35;
const STEP_ICON_SIZE = 18;

/**
 * A reminder time, stepped half an hour at a time.
 *
 * A stepper rather than a native time picker for the same reason the start date uses one:
 * `@react-native-community/datetimepicker` has no web support, and the browser is where this app
 * is reviewed.
 */
export const ReminderRow = ({
  label,
  time,
  isDisabled,
  isFirst,
  onEarlier,
  onLater,
}: ReminderRowProps) => {
  const { t } = useTranslation();
  const dividerStyle = isFirst ? null : styles.divider;
  const disabledStyle = isDisabled ? styles.disabled : null;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.reminderEarlier', { label })}
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={onEarlier}
          style={[styles.step, disabledStyle]}
        >
          <AntDesign name="minus" size={STEP_ICON_SIZE} color={colors.text} />
        </Pressable>
        <Text style={[styles.time, disabledStyle]}>{time}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.reminderLater', { label })}
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={onLater}
          style={[styles.step, disabledStyle]}
        >
          <AntDesign name="plus" size={STEP_ICON_SIZE} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
};

const TIME_WIDTH = 64;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxxl,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  label: {
    ...typography.ruleName,
    color: colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  step: {
    width: MINIMUM_TAP_TARGET,
    height: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.raised,
  },
  time: {
    ...typography.legendValue,
    width: TIME_WIDTH,
    color: colors.text,
    textAlign: 'center',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});
