import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Achievement } from '@/domain/achievements';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { BadgeRow } from './BadgeRow';
import { ProfileCardHeader } from './ProfileCardHeader';

export type BadgesCardProps = {
  achievements: readonly Achievement[];
};

const FIRST = 0;

export const BadgesCard = ({ achievements }: BadgesCardProps) => {
  const { t } = useTranslation();
  const earned = achievements.filter((achievement) => achievement.isEarned).length;

  return (
    <Card>
      <ProfileCardHeader
        title={t('badges.title')}
        badge={t('badges.earned', { count: earned, total: achievements.length })}
      />
      <View style={styles.rows}>
        {achievements.map((achievement, index) => (
          <BadgeRow key={achievement.id} achievement={achievement} isFirst={index === FIRST} />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  rows: {
    marginTop: spacing.lg,
  },
});
