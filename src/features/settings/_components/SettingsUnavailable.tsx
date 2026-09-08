import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SettingsUnavailableProps = {
  onRetry: () => void;
};

/**
 * Shown when the settings record could not be read.
 *
 * Nothing is editable here, and that is the point: a screen rendered over guessed defaults would
 * write those guesses over whatever is really on the device the moment anything is touched.
 */
export const SettingsUnavailable = ({ onRetry }: SettingsUnavailableProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.message}>{t('settings.unavailable')}</Text>
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
