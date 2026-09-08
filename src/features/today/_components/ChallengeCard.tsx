import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { TodayCardHeader } from './TodayCardHeader';

export type ChallengeCardProps = {
  perfectDays: number;
  daysRemaining: number;
};

export const ChallengeCard = ({ perfectDays, daysRemaining }: ChallengeCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <TodayCardHeader
        title={t('today.challengeTitle')}
        badge={t('today.daysToGo', { days: daysRemaining })}
      />
      <View style={styles.split}>
        <View style={styles.half}>
          <Text style={styles.value}>{perfectDays}</Text>
          <Text style={styles.label}>{t('today.perfectDays')}</Text>
        </View>
        <View style={styles.half}>
          <Text style={styles.value}>{daysRemaining}</Text>
          <Text style={styles.label}>{t('today.daysRemaining')}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  split: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  half: {
    flex: 1,
    gap: spacing.xs,
  },
  value: {
    ...typography.tileValue,
    color: colors.text,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
