import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ProfileUnavailableProps = {
  onRetry: () => void;
};

/**
 * Shown when the challenge could not be read. It offers a retry and nothing else — in particular
 * no way to reset, because erasing on the strength of a failed read is how a streak disappears.
 */
export const ProfileUnavailable = ({ onRetry }: ProfileUnavailableProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.message}>{t('profile.unavailable')}</Text>
      <PrimaryButton
        label={t('entry.retry')}
        accessibilityLabel={t('entry.retry')}
        onPress={onRetry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.giant,
    padding: spacing.massive,
    backgroundColor: colors.bg,
  },
  message: {
    ...typography.ruleName,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
