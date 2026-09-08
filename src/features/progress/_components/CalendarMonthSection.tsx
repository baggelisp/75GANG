import { CalendarWeek } from '@/components/calendar/CalendarWeek';
import { MonthTitle } from '@/components/calendar/MonthTitle';
import { CalendarMonth } from '@/domain/monthGrid';
import { GridDay } from '@/domain/progressGrid';
import { Translate } from '@/i18n';
import { formatMonthTitle } from '@/utils/DateUtility';

import { CalendarDaySlot } from './CalendarDaySlot';

export type CalendarMonthSectionProps = {
  month: CalendarMonth<GridDay>;
  locale: string;
  t: Translate;
  onPressDay: (dayNumber: number) => void;
};

const FIRST_OF_MONTH_SUFFIX = '-01';

export const CalendarMonthSection = ({
  month,
  locale,
  t,
  onPressDay,
}: CalendarMonthSectionProps) => {
  return (
    <>
      <MonthTitle>{formatMonthTitle(`${month.key}${FIRST_OF_MONTH_SUFFIX}`, locale)}</MonthTitle>
      {month.weeks.map((week, weekIndex) => (
        <CalendarWeek key={`${month.key}-${weekIndex}`}>
          {week.map((day, dayIndex) => (
            <CalendarDaySlot
              key={day?.date ?? `${month.key}-${weekIndex}-${dayIndex}`}
              day={day}
              t={t}
              onPressDay={onPressDay}
            />
          ))}
        </CalendarWeek>
      ))}
    </>
  );
};
