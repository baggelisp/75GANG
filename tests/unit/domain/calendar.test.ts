import { countDaysBetween, countDaysFromCivil, toDayNumber } from '@/domain/calendar';

describe('countDaysFromCivil', () => {
  it.each([
    ['the unix epoch', 1970, 1, 1, 0],
    ['the day after the epoch', 1970, 1, 2, 1],
    ['the day before the epoch', 1969, 12, 31, -1],
    ['a leap day', 2028, 2, 29, 21243],
    ['a 400 year boundary', 2000, 3, 1, 11017],
  ])('places %s at %s', (_description, year, month, day, expected) => {
    expect(countDaysFromCivil(year, month, day)).toBe(expected);
  });

  it('agrees with UTC date arithmetic across a century boundary', () => {
    const millisecondsPerDay = 86400000;
    const expected = Date.UTC(2100, 2, 1) / millisecondsPerDay;

    expect(countDaysFromCivil(2100, 3, 1)).toBe(expected);
  });
});

describe('countDaysBetween', () => {
  it('counts a single day forward', () => {
    expect(countDaysBetween('2026-09-07', '2026-09-08')).toBe(1);
  });

  it('counts backwards as a negative number', () => {
    expect(countDaysBetween('2026-09-08', '2026-09-07')).toBe(-1);
  });

  it('counts a full non-leap year', () => {
    expect(countDaysBetween('2026-01-01', '2027-01-01')).toBe(365);
  });

  it('counts a full leap year', () => {
    expect(countDaysBetween('2028-01-01', '2029-01-01')).toBe(366);
  });

  it('returns null for a date that is not a real calendar day', () => {
    expect(countDaysBetween('2026-09-07', '2026-02-30')).toBeNull();
  });
});

describe('toDayNumber', () => {
  it('rejects a malformed date rather than guessing', () => {
    expect(toDayNumber('07/09/2026')).toBeNull();
  });
});
