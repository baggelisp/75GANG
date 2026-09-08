import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type WeightStepperProps = {
  weight: string;
  onChangeWeight: (text: string) => void;
  onStepDown: () => void;
  onStepUp: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const STEP_ICON_SIZE = 20;

/**
 * Weight to one decimal: step it a tenth at a time, or type it if the scale said something else.
 *
 * The placeholder matters more than it looks: a day with no weigh-in yet showed an empty box with
 * a `kg` floating beside it, which read as a screen that had failed to load rather than one
 * waiting for a number.
 */
export const WeightStepper = ({
  weight,
  onChangeWeight,
  onStepDown,
  onStepUp,
}: WeightStepperProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('weighIn.stepDown')}
        onPress={onStepDown}
        style={styles.step}
      >
        <AntDesign name="minus" size={STEP_ICON_SIZE} color={colors.text} />
      </Pressable>

      <View style={styles.readout}>
        <TextInput
          accessibilityLabel={t('weighIn.weightLabel')}
          placeholder={t('weighIn.weightPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={weight}
          onChangeText={onChangeWeight}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Text style={styles.unit}>{t('weighIn.kilograms')}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('weighIn.stepUp')}
        onPress={onStepUp}
        style={styles.step}
      >
        <AntDesign name="plus" size={STEP_ICON_SIZE} color={colors.text} />
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
  readout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  input: {
    ...typography.hero,
    color: colors.text,
    textAlign: 'center',
    minWidth: 120,
  },
  unit: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
