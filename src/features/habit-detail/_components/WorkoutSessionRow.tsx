import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { WorkoutOutdoorTag } from './WorkoutOutdoorTag';

export type WorkoutSessionRowProps = {
  index: number;
  isFirst: boolean;
  minutes: number;
  isOutdoor: boolean;
  isLongEnough: boolean;
};

export const WorkoutSessionRow = ({
  index,
  isFirst,
  minutes,
  isOutdoor,
  isLongEnough,
}: WorkoutSessionRowProps) => {
  const { t } = useTranslation();
  const minutesStyle = isLongEnough ? styles.minutesCounted : styles.minutes;
  const dividerStyle = isFirst ? null : styles.divider;

  return (
    <View style={[styles.row, dividerStyle]}>
      <Text style={styles.label}>{t('timer.session', { number: index + 1 })}</Text>
      <Text style={minutesStyle}>{t('timer.minutes', { minutes: Math.round(minutes) })}</Text>
      <WorkoutOutdoorTag isOutdoor={isOutdoor} />
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
    flex: 1,
  },
  minutes: {
    ...typography.ruleName,
    color: colors.textSecondary,
  },
  minutesCounted: {
    ...typography.ruleName,
    color: colors.text,
  },
});
