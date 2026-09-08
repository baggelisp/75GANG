import { StyleSheet, View } from 'react-native';

import { AccentTile } from '@/components/AccentTile';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { AccentEnum } from '@/theme/tokens';

export type TodayTilesProps = {
  currentStreak: number;
  longestStreak: number;
  completedHabits: number;
  totalHabits: number;
};

/**
 * The two filled tiles from the mockup. The weight tile it shows lands in feature 13, once there
 * is weight history to draw and only on the challenge that records it — until then the second
 * tile carries today's score, which every challenge has.
 */
export const TodayTiles = ({
  currentStreak,
  longestStreak,
  completedHabits,
  totalHabits,
}: TodayTilesProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <AccentTile
          accent={AccentEnum.BUTTER}
          label={t('today.streak')}
          value={`${currentStreak}`}
          footnote={t('today.bestStreak', { days: longestStreak })}
        />
      </View>
      <View style={styles.tile}>
        <AccentTile
          accent={AccentEnum.LAVENDER}
          label={t('today.todayScore')}
          value={`${completedHabits}/${totalHabits}`}
          footnote={t('today.rulesDone')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tile: {
    flex: 1,
  },
});
