import { Pressable, StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type OutdoorToggleProps = {
  isOutdoor: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const DISABLED_OPACITY = 0.4;

/** Rule 4 says one workout ideally outdoors, so this is recorded but never required. */
export const OutdoorToggle = ({ isOutdoor, isDisabled, onToggle }: OutdoorToggleProps) => {
  const { t } = useTranslation();
  const stateStyle = isOutdoor ? styles.on : styles.off;
  const disabledStyle = isDisabled ? styles.disabled : null;
  const labelStyle = isOutdoor ? styles.labelOn : styles.labelOff;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isOutdoor, disabled: isDisabled }}
      accessibilityLabel={t('timer.outdoor')}
      disabled={isDisabled}
      onPress={onToggle}
      style={[styles.toggle, stateStyle, disabledStyle]}
    >
      <Text style={labelStyle}>{t('timer.outdoor')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  toggle: {
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.massive,
  },
  on: {
    backgroundColor: colors.lavender,
  },
  off: {
    backgroundColor: colors.raised,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  labelOn: {
    ...typography.sectionLabel,
    color: colors.ink,
  },
  labelOff: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
