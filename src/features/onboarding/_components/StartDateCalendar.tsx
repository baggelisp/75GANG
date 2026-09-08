import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PeriodStepper } from '@/components/calendar/PeriodStepper';
import { CalendarWeek } from '@/components/calendar/CalendarWeek';
import { WeekdayHeader } from '@/components/calendar/WeekdayHeader';
import {
  addCalendarMonths,
  buildCalendarMonths,
  listMonthDays,
  readMonthKey,
} from '@/domain/monthGrid';
import { IsoDate } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { formatMonthTitle, listWeekdayInitials } from '@/utils/DateUtility';

import { StartDateSlot } from './StartDateSlot';

export type StartDateCalendarProps = {
  selected: IsoDate;
  today: IsoDate;
  earliest: IsoDate;
  onSelect: (date: IsoDate) => void;
};

const ONE_MONTH = 1;
const FIRST_OF_MONTH = '-01';

/**
 * Picking the day the challenge began.
 *
 * A calendar rather than a one-day-at-a-time stepper: someone already four days in had to tap
 * four times and count in their head, when what they actually remember is "the Monday". A native
 * date picker was not an option — `@react-native-community/datetimepicker` has no web support, and
 * the browser is where this app is reviewed.
 */
export const StartDateCalendar = ({
  selected,
  today,
  earliest,
  onSelect,
}: StartDateCalendarProps) => {
  const { t, locale } = useTranslation();
  const [visibleMonth, setVisibleMonth] = useState(readMonthKey(selected) ?? readMonthKey(today));

  const monthKey = visibleMonth ?? readMonthKey(today) ?? '';
  const days = listMonthDays(monthKey).map((date) => ({ date }));
  const [month] = buildCalendarMonths(days);

  const canGoBack = monthKey > (readMonthKey(earliest) ?? monthKey);
  const canGoForward = monthKey < (readMonthKey(today) ?? monthKey);

  const goBack = () => setVisibleMonth(addCalendarMonths(monthKey, -ONE_MONTH));
  const goForward = () => setVisibleMonth(addCalendarMonths(monthKey, ONE_MONTH));

  return (
    <View style={styles.calendar}>
      <PeriodStepper
        title={formatMonthTitle(`${monthKey}${FIRST_OF_MONTH}`, locale)}
        backLabel={t('start.previousMonth')}
        forwardLabel={t('start.nextMonth')}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={goBack}
        onForward={goForward}
      />

      <View style={styles.grid}>
        <WeekdayHeader labels={listWeekdayInitials(locale)} />
        {month?.weeks.map((week, weekIndex) => (
          <CalendarWeek key={`${monthKey}-${weekIndex}`}>
            {week.map((day, dayIndex) => (
              <StartDateSlot
                key={day?.date ?? `${monthKey}-${weekIndex}-${dayIndex}`}
                date={day?.date ?? null}
                selected={selected}
                today={today}
                earliest={earliest}
                locale={locale}
                onSelect={onSelect}
              />
            ))}
          </CalendarWeek>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    marginTop: spacing.xxs,
  },
  calendar: {
    gap: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.xxxl,
  },
});
