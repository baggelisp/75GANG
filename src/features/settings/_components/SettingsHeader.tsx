import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SettingsHeaderProps = {
  onBack: () => void;
};

export const SettingsHeader = ({ onBack }: SettingsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.back}>
        <BackButton
          label={t('settings.back')}
          accessibilityLabel={t('settings.backAccessibility')}
          onPress={onBack}
        />
      </View>
      <Text style={styles.title}>{t('settings.title')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.xxxl,
  },
  back: {
    alignSelf: 'flex-start',
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
});
