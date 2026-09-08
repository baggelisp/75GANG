import { Pressable, StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type WriteErrorBannerProps = {
  isVisible: boolean;
  onDismiss: () => void;
};

/**
 * Says plainly that the tap was not saved.
 *
 * The screen never showed it as done in the first place — the write comes before the state — so
 * this tells the user to try again rather than correcting something they already believed.
 *
 * Deliberately not coral: on this screen coral means done, and a coral bar between the rings and
 * the rules would read as success.
 */
export const WriteErrorBanner = ({ isVisible, onDismiss }: WriteErrorBannerProps) => {
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
        {t('today.writeFailed')}
      </Text>
    </Pressable>
  );
};

const MINIMUM_TAP_TARGET = 44;

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
