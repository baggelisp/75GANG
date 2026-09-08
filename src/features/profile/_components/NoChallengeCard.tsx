import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type NoChallengeCardProps = {
  onStart: () => void;
};

/** What the Profile tab shows after a reset, when there is no challenge left to describe. */
export const NoChallengeCard = ({ onStart }: NoChallengeCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.noChallengeTitle')}</Text>
        <Text style={styles.body}>{t('profile.noChallengeBody')}</Text>
        <PrimaryButton
          label={t('profile.startChallenge')}
          accessibilityLabel={t('profile.startChallenge')}
          onPress={onStart}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxxl,
  },
  title: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  body: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
