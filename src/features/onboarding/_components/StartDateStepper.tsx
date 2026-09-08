import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { StartDateCaption } from './StartDateCaption';

export type StartDateStepperProps = {
  formattedDate: string;
  isToday: boolean;
  canGoEarlier: boolean;
  onEarlier: () => void;
  onLater: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const DISABLED_OPACITY = 0.35;

/**
 * A stepper rather than a native date picker: `@react-native-community/datetimepicker` has no web
 * support, and the browser is where this app is reviewed. It also matches how the date is really
 * chosen — a few days back at most, because being already mid-challenge is the only reason to move
 * it.
 *
 * Both ends are bounded. Forward stops at today, and back stops at the earliest date that still
 * leaves a day of the challenge to live.
 */
export const StartDateStepper = ({
  formattedDate,
  isToday,
  canGoEarlier,
  onEarlier,
  onLater,
}: StartDateStepperProps) => {
  const { t } = useTranslation();
  const earlierStyle = canGoEarlier ? null : styles.stepDisabled;
  const laterStyle = isToday ? styles.stepDisabled : null;

  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('start.earlier')}
        accessibilityState={{ disabled: !canGoEarlier }}
        disabled={!canGoEarlier}
        onPress={onEarlier}
        style={[styles.step, earlierStyle]}
      >
        <Text style={styles.stepLabel}>-</Text>
      </Pressable>

      <View style={styles.readout}>
        <Text style={styles.date}>{formattedDate}</Text>
        <StartDateCaption isToday={isToday} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('start.later')}
        accessibilityState={{ disabled: isToday }}
        disabled={isToday}
        onPress={onLater}
        style={[styles.step, laterStyle]}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  step: {
    width: MINIMUM_TAP_TARGET,
    height: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.raised,
  },
  stepDisabled: {
    opacity: DISABLED_OPACITY,
  },
  stepLabel: {
    ...typography.statValue,
    color: colors.text,
  },
  readout: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  date: {
    ...typography.legendValue,
    color: colors.text,
  },
});
