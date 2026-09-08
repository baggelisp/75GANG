import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ProgressRings } from '@/components/charts/ProgressRings';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { AccentEnum } from '@/theme/tokens';

import { RingLegendRow } from './RingLegendRow';
import { TodayCardHeader } from './TodayCardHeader';

export type TodayRingsCardProps = {
  habitsCompleted: number;
  habitsTarget: number;
  workoutsCompleted: number;
  workoutsTarget: number;
  waterLitres: number;
  waterTargetLitres: number;
  percentComplete: number;
};

const RINGS_SIZE = 128;

/**
 * The Today card: three rings and their legend. Habits outermost in coral, workouts in lavender,
 * water innermost in butter, exactly as the design system assigns them.
 */
export const TodayRingsCard = ({
  habitsCompleted,
  habitsTarget,
  workoutsCompleted,
  workoutsTarget,
  waterLitres,
  waterTargetLitres,
  percentComplete,
}: TodayRingsCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <TodayCardHeader
        title={t('today.cardTitle')}
        badge={t('today.percentComplete', { percent: percentComplete })}
      />
      <View style={styles.body}>
        <ProgressRings
          habitsCompleted={habitsCompleted}
          habitsTarget={habitsTarget}
          workoutsCompleted={workoutsCompleted}
          workoutsTarget={workoutsTarget}
          waterLitres={waterLitres}
          waterTargetLitres={waterTargetLitres}
          size={RINGS_SIZE}
          accessibilityLabel={t('today.ringsLabel', {
            habitsDone: habitsCompleted,
            habitsTotal: habitsTarget,
            workoutsDone: workoutsCompleted,
            workoutsTotal: workoutsTarget,
            water: waterLitres,
            waterTarget: waterTargetLitres,
          })}
        />
        <View style={styles.legend}>
          <RingLegendRow
            label={t('today.habits')}
            accent={AccentEnum.CORAL}
            value={`${habitsCompleted}`}
            unit={t('today.done')}
            fraction={`${habitsCompleted}/${habitsTarget}`}
          />
          <RingLegendRow
            label={t('today.workouts')}
            accent={AccentEnum.LAVENDER}
            value={`${workoutsCompleted}`}
            unit={t('today.sessions')}
            fraction={`${workoutsCompleted}/${workoutsTarget}`}
          />
          <RingLegendRow
            label={t('today.water')}
            accent={AccentEnum.BUTTER}
            value={`${waterLitres}`}
            unit={t('today.litres')}
            fraction={`${waterLitres}/${waterTargetLitres}`}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxxl,
    marginTop: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.lg,
  },
});
