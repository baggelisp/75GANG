import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { CreditRow } from './CreditRow';
import { SettingsSection } from './SettingsSection';

/**
 * Where the artwork, the icons and the type came from.
 *
 * At the bottom of Settings rather than on the onboarding slides the illustrations appear on: a
 * credit in front of someone deciding whether to start a 75 day challenge is in their way, and a
 * credit they can find when they wonder is not.
 */
export const CreditsSection = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t('credits.title')}>
      <CreditRow
        label={t('credits.illustrationsLabel')}
        source={t('credits.illustrationsSource')}
        isFirst
      />
      <CreditRow
        label={t('credits.iconsLabel')}
        source={t('credits.iconsSource')}
        isFirst={false}
      />
      <CreditRow
        label={t('credits.fontsLabel')}
        source={t('credits.fontsSource')}
        isFirst={false}
      />
      <Text style={styles.note}>{t('credits.note')}</Text>
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  /** A sentence, not an axis label, so it takes `textSecondary` like every other line of copy. */
  note: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
    paddingTop: spacing.xl,
  },
});
