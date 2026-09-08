import { CalendarSlot } from '@/components/calendar/CalendarSlot';
import { IsoDate } from '@/domain/types';
import { formatDayOfMonth, formatLongDate } from '@/utils/DateUtility';

import { StartDateDayCell } from './StartDateDayCell';

export type StartDateSlotProps = {
  /** Null where the month has no day in this column. */
  date: IsoDate | null;
  selected: IsoDate;
  today: IsoDate;
  earliest: IsoDate;
  locale: string;
  onSelect: (date: IsoDate) => void;
};

/** One of the seven columns in a week of the start-date calendar. */
export const StartDateSlot = ({
  date,
  selected,
  today,
  earliest,
  locale,
  onSelect,
}: StartDateSlotProps) => {
  if (date === null) {
    return <CalendarSlot>{null}</CalendarSlot>;
  }

  const select = () => onSelect(date);

  return (
    <CalendarSlot>
      <StartDateDayCell
        dayOfMonth={formatDayOfMonth(date)}
        isSelected={date === selected}
        isToday={date === today}
        isSelectable={date >= earliest && date <= today}
        accessibilityLabel={formatLongDate(date, locale)}
        onPress={select}
      />
    </CalendarSlot>
  );
};
