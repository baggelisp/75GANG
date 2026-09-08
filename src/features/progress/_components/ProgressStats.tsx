import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { StatRow } from '@/components/StatRow';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { ProgressCardHeader } from './ProgressCardHeader';

export type ProgressStatsProps = {
  currentDay: number;
  daysRemaining: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
};

export const ProgressStats = ({
  currentDay,
  daysRemaining,
  perfectDays,
  currentStreak,
  longestStreak,
}: ProgressStatsProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <ProgressCardHeader
        title={t('progress.statsTitle')}
        badge={t('stats.dayOf', { day: currentDay })}
      />
      <View style={styles.rows}>
        <StatRow label={t('stats.perfectDays')} value={`${perfectDays}`} isFirst />
        <StatRow label={t('stats.daysRemaining')} value={`${daysRemaining}`} isFirst={false} />
        <StatRow label={t('stats.currentStreak')} value={`${currentStreak}`} isFirst={false} />
        <StatRow label={t('stats.bestStreak')} value={`${longestStreak}`} isFirst={false} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  rows: {
    marginTop: spacing.lg,
  },
});
