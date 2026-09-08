import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

const SWATCH_SIZE = 10;
const RING_WIDTH = 2;

/**
 * What the cells mean.
 *
 * A calendar in three states needs saying once in words. "Coral is perfect" told a colour-blind
 * reader nothing, and said nothing at all about the difference between a day that was missed and
 * one that has not happened yet.
 */
export const CalendarLegend = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.legend}>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.perfect]} />
        <Text style={styles.label}>{t('progress.legendPerfect')}</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.today]} />
        <Text style={styles.label}>{t('progress.legendToday')}</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.missed]} />
        <Text style={styles.label}>{t('progress.legendMissed')}</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.toCome]} />
        <Text style={styles.label}>{t('progress.legendToCome')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: radii.pill,
    borderWidth: RING_WIDTH,
  },
  /**
   * `textSecondary`, not `textTertiary`: this legend is the non-colour channel carrying all four
   * cell states, so it is content the user must be able to read, not a hint.
   */
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  perfect: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  today: {
    backgroundColor: colors.butter,
    borderColor: colors.butter,
  },
  missed: {
    backgroundColor: colors.raised,
    borderColor: colors.raised,
  },
  toCome: {
    backgroundColor: colors.bg,
    borderColor: colors.hairline,
  },
});
