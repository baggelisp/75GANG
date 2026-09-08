import {
  addCalendarMonths,
  buildCalendarMonths,
  decideWeekdayIndex,
  DAYS_PER_WEEK,
  listMonthDays,
  readMonthKey,
} from '@/domain/monthGrid';

type Day = { date: string; label: string };

const day = (date: string): Day => ({ date, label: date });

describe('which weekday a date falls on', () => {
  it.each([
    ['2026-09-07', 0],
    ['2026-09-08', 1],
    ['2026-09-09', 2],
    ['2026-09-10', 3],
    ['2026-09-11', 4],
    ['2026-09-12', 5],
    ['2026-09-13', 6],
  ])('reads %s as index %i, counting from Monday', (date, index) => {
    expect(decideWeekdayIndex(date)).toBe(index);
  });

  it('is null for something that is not a date', () => {
    expect(decideWeekdayIndex('2026-02-30')).toBeNull();
  });
});

describe('the month a date belongs to', () => {
  it('is the year and the month', () => {
    expect(readMonthKey('2026-09-08')).toBe('2026-09');
  });

  it('is null for something that is not a date', () => {
    expect(readMonthKey('nonsense')).toBeNull();
  });
});

describe('laying days out as calendar months', () => {
  it('groups them by month, oldest first', () => {
    const months = buildCalendarMonths([day('2026-09-30'), day('2026-10-01')]);

    expect(months.map((month) => month.key)).toEqual(['2026-09', '2026-10']);
  });

  it('gives each month its year and month number', () => {
    const [september] = buildCalendarMonths([day('2026-09-08')]);

    expect(september?.year).toBe(2026);
    expect(september?.month).toBe(9);
  });

  it('lays every week out as seven slots', () => {
    const days = Array.from({ length: 30 }, (_unused, index) =>
      day(`2026-09-${`${index + 1}`.padStart(2, '0')}`),
    );

    const [september] = buildCalendarMonths(days);

    expect(september?.weeks.every((week) => week.length === DAYS_PER_WEEK)).toBe(true);
  });

  it('pads the start of the first week so a day sits under its weekday', () => {
    // 1 September 2026 is a Tuesday: one empty slot before it.
    const [september] = buildCalendarMonths([day('2026-09-01')]);

    expect(september?.weeks[0]?.slice(0, 3)).toEqual([null, day('2026-09-01'), null]);
  });

  it('keeps a day in its real position in the month, not in the first row', () => {
    const [september] = buildCalendarMonths([day('2026-09-30')]);

    // 30 September 2026 is a Wednesday in the month's fifth week.
    expect(september?.weeks).toHaveLength(5);
    expect(september?.weeks[4]).toEqual([null, null, day('2026-09-30'), null, null, null, null]);
  });

  it('leaves a gap where a day is missing rather than shifting the ones after it', () => {
    const [september] = buildCalendarMonths([day('2026-09-07'), day('2026-09-09')]);

    // Monday the 7th and Wednesday the 9th, with the Tuesday between them left empty.
    expect(september?.weeks[1]).toEqual([
      day('2026-09-07'),
      null,
      day('2026-09-09'),
      null,
      null,
      null,
      null,
    ]);
  });

  it('spans as many weeks as the days need', () => {
    const days = Array.from({ length: 31 }, (_unused, index) =>
      day(`2026-08-${`${index + 1}`.padStart(2, '0')}`),
    );

    // 1 August 2026 is a Saturday, so the month runs into a sixth week row.
    expect(buildCalendarMonths(days)[0]?.weeks).toHaveLength(6);
  });

  it('ignores a day whose date is not a real one', () => {
    expect(buildCalendarMonths([day('2026-02-30'), day('2026-09-08')])).toHaveLength(1);
  });

  it('has nothing to lay out when there are no days', () => {
    expect(buildCalendarMonths([])).toEqual([]);
  });
});

describe('every day of a month', () => {
  it('runs from the first to the last', () => {
    const days = listMonthDays('2026-09');

    expect(days[0]).toBe('2026-09-01');
    expect(days[days.length - 1]).toBe('2026-09-30');
    expect(days).toHaveLength(30);
  });

  it.each([
    ['2026-01', 31],
    ['2026-02', 28],
    ['2028-02', 29],
    ['2026-04', 30],
    ['2026-12', 31],
  ])('gives %s %i days', (monthKey, length) => {
    expect(listMonthDays(monthKey)).toHaveLength(length);
  });

  it('has nothing for a month that does not exist', () => {
    expect(listMonthDays('2026-13')).toEqual([]);
    expect(listMonthDays('nonsense')).toEqual([]);
  });
});

describe('stepping months', () => {
  it('moves forward', () => {
    expect(addCalendarMonths('2026-09', 1)).toBe('2026-10');
  });

  it('moves back', () => {
    expect(addCalendarMonths('2026-09', -1)).toBe('2026-08');
  });

  it('rolls into the next year', () => {
    expect(addCalendarMonths('2026-12', 1)).toBe('2027-01');
  });

  it('rolls into the previous year', () => {
    expect(addCalendarMonths('2026-01', -1)).toBe('2025-12');
  });

  it('steps by more than a year', () => {
    expect(addCalendarMonths('2026-09', 14)).toBe('2027-11');
  });

  it('leaves a month it cannot read alone', () => {
    expect(addCalendarMonths('nonsense', 1)).toBe('nonsense');
  });
});
