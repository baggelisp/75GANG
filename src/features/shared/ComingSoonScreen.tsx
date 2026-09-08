import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ComingSoonScreenProps = {
  titleKey: string;
};

/** Stands in for a tab whose screen has not been built yet, so navigation is real from day one. */
export const ComingSoonScreen = ({ titleKey }: ComingSoonScreenProps) => {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>{t(titleKey)}</Text>
        <Text style={styles.body}>{t('today.comingSoon')}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  body: {
    ...typography.ruleName,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
