import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { StatRow } from '@/components/StatRow';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { ProfileCardHeader } from './ProfileCardHeader';

export type ProfileStatsCardProps = {
  currentDay: number;
  daysRemaining: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
};

export const ProfileStatsCard = ({
  currentDay,
  daysRemaining,
  perfectDays,
  currentStreak,
  longestStreak,
}: ProfileStatsCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <ProfileCardHeader
        title={t('profile.statsTitle')}
        badge={t('stats.dayOf', { day: currentDay })}
      />
      <View style={styles.rows}>
        <StatRow label={t('stats.currentStreak')} value={`${currentStreak}`} isFirst />
        <StatRow label={t('stats.bestStreak')} value={`${longestStreak}`} isFirst={false} />
        <StatRow label={t('stats.perfectDays')} value={`${perfectDays}`} isFirst={false} />
        <StatRow label={t('stats.daysRemaining')} value={`${daysRemaining}`} isFirst={false} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  rows: {
    marginTop: spacing.lg,
  },
});
