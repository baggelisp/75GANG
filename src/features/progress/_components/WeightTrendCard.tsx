import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { TrendLine } from '@/components/charts/TrendLine';
import { decideHasLine, plotWeightPoints, WeightPoint } from '@/domain/weightTrend';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { ProgressCardHeader } from './ProgressCardHeader';

export type WeightTrendCardProps = {
  points: readonly WeightPoint[];
};

const PLOT_WIDTH = 300;
const PLOT_HEIGHT = 92;

/**
 * The weight trend across the challenge so far.
 *
 * It degrades honestly: nothing recorded shows an empty state, a single weigh-in shows the point
 * and no line, and a gap in the history is a gap between points rather than a value invented for a
 * day nobody stood on the scales.
 */
export const WeightTrendCard = ({ points }: WeightTrendCardProps) => {
  const { t } = useTranslation();
  const latest = points[points.length - 1];
  const latestWeight = latest?.kilograms ?? 0;

  if (points.length === 0) {
    return (
      <Card>
        <ProgressCardHeader title={t('progress.trendTitle')} badge={t('progress.noWeighIns')} />
        <Text style={styles.empty}>{t('progress.trendEmpty')}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <ProgressCardHeader
        title={t('progress.trendTitle')}
        badge={t('progress.weighInCount', { count: points.length })}
      />
      <View style={styles.summary}>
        <Text style={styles.latest}>{t('progress.latestWeight', { weight: latestWeight })}</Text>
        <Text style={styles.caption}>
          {t(decideHasLine(points) ? 'progress.trendCaption' : 'progress.trendSinglePoint')}
        </Text>
      </View>
      <TrendLine
        plots={plotWeightPoints(points, { width: PLOT_WIDTH, height: PLOT_HEIGHT })}
        width={PLOT_WIDTH}
        height={PLOT_HEIGHT}
        accessibilityLabel={t('progress.trendLabel', {
          count: points.length,
          weight: latestWeight,
        })}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  latest: {
    ...typography.statValue,
    color: colors.text,
  },
  caption: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  empty: {
    ...typography.ruleName,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
