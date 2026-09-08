import { CalendarSlot } from '@/components/calendar/CalendarSlot';
import { decideIsTappable, GridDay } from '@/domain/progressGrid';
import { Translate } from '@/i18n';
import { formatDayOfMonth } from '@/utils/DateUtility';

import { CalendarDayCell } from './CalendarDayCell';

export type CalendarDaySlotProps = {
  /** Null where the month has no day in this column — the padding either side of it. */
  day: GridDay | null;
  t: Translate;
  onPressDay: (dayNumber: number) => void;
};

/** One of the seven columns in a week, filled or empty. */
export const CalendarDaySlot = ({ day, t, onPressDay }: CalendarDaySlotProps) => {
  if (day === null) {
    return <CalendarSlot>{null}</CalendarSlot>;
  }

  return (
    <CalendarSlot>
      <CalendarDayCell
        dayOfMonth={formatDayOfMonth(day.date)}
        dayNumber={day.dayNumber}
        state={day.state}
        isTappable={decideIsTappable(day)}
        accessibilityLabel={t(`progress.cell.${day.state}`, { day: day.dayNumber })}
        onPress={onPressDay}
      />
    </CalendarSlot>
  );
};
