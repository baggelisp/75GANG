import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type PeriodStepperProps = {
  title: string;
  backLabel: string;
  forwardLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const ARROW_SIZE = 16;
const DISABLED_OPACITY = 0.3;

/**
 * Moving one period at a time — a month in the start-date calendar, a day in the day view.
 *
 * The ends are bounded rather than hidden: a stepper whose arrow disappears at the edge makes the
 * user wonder where the control went, while a dimmed one says plainly that this is as far as the
 * data goes.
 */
export const PeriodStepper = ({
  title,
  backLabel,
  forwardLabel,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: PeriodStepperProps) => {
  const backStyle = canGoBack ? null : styles.disabled;
  const forwardStyle = canGoForward ? null : styles.disabled;

  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        accessibilityState={{ disabled: !canGoBack }}
        disabled={!canGoBack}
        onPress={onBack}
        style={[styles.step, backStyle]}
      >
        <AntDesign name="arrow-left" size={ARROW_SIZE} color={colors.text} />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={forwardLabel}
        accessibilityState={{ disabled: !canGoForward }}
        disabled={!canGoForward}
        onPress={onForward}
        style={[styles.step, forwardStyle]}
      >
        <AntDesign name="arrow-right" size={ARROW_SIZE} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  title: {
    ...typography.sectionLabel,
    flex: 1,
    color: colors.text,
    textAlign: 'center',
  },
});
