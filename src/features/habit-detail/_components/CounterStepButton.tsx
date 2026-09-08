import { Pressable, StyleSheet, Text } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type CounterStepButtonProps = {
  label: string;
  amount: number;
  onStep: (amount: number) => void;
};

const MINIMUM_TAP_TARGET = 44;

export const CounterStepButton = ({ label, amount, onStep }: CounterStepButtonProps) => {
  const press = () => {
    onStep(amount);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={press}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.raised,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
