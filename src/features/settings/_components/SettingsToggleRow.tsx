import { StyleSheet, Text, View } from 'react-native';

import { ToggleSwitch } from '@/components/ToggleSwitch';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SettingsToggleRowProps = {
  label: string;
  hint: string;
  isOn: boolean;
  isLocked: boolean;
  onToggle: () => void;
};

/**
 * A setting that is either on or off.
 *
 * A locked row still shows its real position rather than disappearing: the user can see that the
 * app is dark and that the choice is not theirs to make in this version.
 */
export const SettingsToggleRow = ({
  label,
  hint,
  isOn,
  isLocked,
  onToggle,
}: SettingsToggleRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <ToggleSwitch
        isOn={isOn}
        isDisabled={isLocked}
        accessibilityLabel={label}
        onToggle={onToggle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxxl,
    paddingVertical: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...typography.ruleName,
    color: colors.text,
  },
  hint: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
