import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { WeekdayHeader } from '@/components/calendar/WeekdayHeader';
import { buildCalendarMonths } from '@/domain/monthGrid';
import { GridDay } from '@/domain/progressGrid';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { listWeekdayInitials } from '@/utils/DateUtility';

import { CalendarLegend } from './CalendarLegend';
import { CalendarMonthSection } from './CalendarMonthSection';
import { ProgressCardHeader } from './ProgressCardHeader';

export type ProgressCalendarProps = {
  grid: readonly GridDay[];
  onPressDay: (dayNumber: number) => void;
};

/**
 * The whole challenge as a calendar rather than a run of dots.
 *
 * Seven columns instead of fifteen: the days line up under their weekdays, every cell carries its
 * date, and the card no longer has to squeeze a row wider than it is. A flat grid was legible as a
 * count and as nothing else — this one can be read against the weeks the user actually lived.
 */
export const ProgressCalendar = ({ grid, onPressDay }: ProgressCalendarProps) => {
  const { t, locale } = useTranslation();
  const months = buildCalendarMonths(grid);

  return (
    <Card>
      <ProgressCardHeader
        title={t('progress.gridTitle')}
        badge={t('progress.calendarBadge', { days: grid.length })}
      />
      <View style={styles.calendar}>
        <WeekdayHeader labels={listWeekdayInitials(locale)} />
        {months.map((month) => (
          <CalendarMonthSection
            key={month.key}
            month={month}
            locale={locale}
            t={t}
            onPressDay={onPressDay}
          />
        ))}
      </View>
      <CalendarLegend />
    </Card>
  );
};

const styles = StyleSheet.create({
  calendar: {
    marginTop: spacing.sm,
  },
});
