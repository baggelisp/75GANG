import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/**
 * Temporary boot target, replaced by the Today screen in feature 07. It exists so the theme and
 * translation layers have somewhere real to render while the domain is built underneath them.
 */
export const PlaceholderScreen = () => {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.centre}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  tagline: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
