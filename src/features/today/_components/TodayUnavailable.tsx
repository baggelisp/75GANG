import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type TodayUnavailableProps = {
  onRetry: () => void;
};

/**
 * Shown when the challenge or the day history could not be read.
 *
 * It deliberately shows no numbers. Rendering a streak of zero over an unreadable history would
 * tell a day-60 user they had lost everything, when nothing is wrong with their data at all.
 */
export const TodayUnavailable = ({ onRetry }: TodayUnavailableProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('today.unavailableTitle')}</Text>
      <Text style={styles.body}>{t('today.unavailableBody')}</Text>
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
