import { Pressable, StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type HabitWriteErrorBannerProps = {
  isVisible: boolean;
  onDismiss: () => void;
};

const MINIMUM_TAP_TARGET = 44;

/** Says plainly that the increment was not saved, rather than leaving the number simply not move. */
export const HabitWriteErrorBanner = ({ isVisible, onDismiss }: HabitWriteErrorBannerProps) => {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('today.writeFailedDismiss')}
      onPress={onDismiss}
      style={styles.banner}
    >
      <Text accessibilityRole="alert" style={styles.text}>
        {t('counter.writeFailed')}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    minHeight: MINIMUM_TAP_TARGET,
    justifyContent: 'center',
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.ruleRow,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  text: {
    ...typography.ruleName,
    color: colors.text,
  },
});
