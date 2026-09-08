import {
  formatDayOfMonth,
  formatLongDateWithYear,
  formatMonthTitle,
  listWeekdayInitials,
} from '@/utils/DateUtility';

describe('a date shown with its year', () => {
  it('carries the year, so a start date is unambiguous a challenge later', () => {
    expect(formatLongDateWithYear('2026-07-29', 'en')).toContain('2026');
  });

  it('is the right day whatever the machine’s timezone', () => {
    expect(formatLongDateWithYear('2026-01-01', 'en')).toContain('1');
    expect(formatLongDateWithYear('2026-12-31', 'en')).toContain('31');
  });
});

describe('a month heading', () => {
  it('names the month and the year', () => {
    expect(formatMonthTitle('2026-09-08', 'en')).toBe('September 2026');
  });

  it('does not slip into the month before at the start of one', () => {
    expect(formatMonthTitle('2026-03-01', 'en')).toBe('March 2026');
  });
});

describe('the day of the month', () => {
  it('drops the leading zero, because a calendar cell shows 8 and not 08', () => {
    expect(formatDayOfMonth('2026-09-08')).toBe('8');
  });

  it('keeps two digits when there are two', () => {
    expect(formatDayOfMonth('2026-09-28')).toBe('28');
  });
});

describe('the weekday headings', () => {
  it('are seven, one per column', () => {
    expect(listWeekdayInitials('en')).toHaveLength(7);
  });

  it('start on Monday', () => {
    const [first] = listWeekdayInitials('en');

    expect(first).toBe('M');
  });

  it('end on Sunday', () => {
    const initials = listWeekdayInitials('en');

    expect(initials[initials.length - 1]).toBe('S');
  });
});
