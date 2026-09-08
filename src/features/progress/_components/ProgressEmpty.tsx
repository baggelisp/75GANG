import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ProgressEmptyProps = {
  messageKey: string;
  onRetry: () => void;
};

/** Shown when the history could not be read. It states nothing about the challenge it cannot see. */
export const ProgressEmpty = ({ messageKey, onRetry }: ProgressEmptyProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.message}>{t(messageKey)}</Text>
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
