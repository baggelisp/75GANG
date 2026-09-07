import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type EntryUnavailableProps = {
  onRetry: () => void;
};

/**
 * Shown when the challenge could not be read from the device. It never offers to start a new
 * challenge: the stored one is probably still there, and starting again would replace it.
 */
export const EntryUnavailable = ({ onRetry }: EntryUnavailableProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('entry.unreadableTitle')}</Text>
      <Text style={styles.body}>{t('entry.unreadableBody')}</Text>
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
  title: {
    ...typography.greeting,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.ruleName,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
