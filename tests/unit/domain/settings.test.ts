import {
  DEFAULT_SETTINGS,
  formatMinutesOfDay,
  isReminderTime,
  MINUTES_PER_DAY,
  REMINDER_STEP_MINUTES,
  shiftReminderTime,
  toMinutesOfDay,
} from '@/domain/settings';
import { isSettings } from '@/domain/validation';

describe('the settings the app ships with', () => {
  it('are a valid settings record, so a first launch never writes a rejected one', () => {
    expect(isSettings(DEFAULT_SETTINGS)).toBe(true);
  });

  it('leave notifications off until the user asks for them', () => {
    expect(DEFAULT_SETTINGS.notificationsEnabled).toBe(false);
  });

  it('are dark, because dark is the only theme this version has', () => {
    expect(DEFAULT_SETTINGS.darkMode).toBe(true);
  });
});

describe('recognising a reminder time', () => {
  it.each(['00:00', '07:30', '09:05', '23:59'])('accepts %s', (time) => {
    expect(isReminderTime(time)).toBe(true);
  });

  it.each(['24:00', '07:60', '7:30', '07:3', '', 'morning', '07-30', '07:30:00'])(
    'rejects %s',
    (time) => {
      expect(isReminderTime(time)).toBe(false);
    },
  );

  it('rejects anything that is not a string', () => {
    expect(isReminderTime(730)).toBe(false);
    expect(isReminderTime(null)).toBe(false);
  });
});

describe('converting a reminder time to minutes', () => {
  it.each([
    ['00:00', 0],
    ['01:00', 60],
    ['07:30', 450],
    ['23:59', 1439],
  ])('reads %s as %i minutes', (time, minutes) => {
    expect(toMinutesOfDay(time)).toBe(minutes);
  });

  it('returns null for a time it cannot read, rather than a plausible number', () => {
    expect(toMinutesOfDay('half seven')).toBeNull();
  });

  it('round-trips every minute of the day', () => {
    const roundTripped = Array.from({ length: MINUTES_PER_DAY }, (_, minute) =>
      toMinutesOfDay(formatMinutesOfDay(minute)),
    );

    expect(roundTripped).toEqual(Array.from({ length: MINUTES_PER_DAY }, (_, minute) => minute));
  });
});

describe('stepping a reminder time', () => {
  it('moves forward by the step', () => {
    expect(shiftReminderTime('07:00', REMINDER_STEP_MINUTES)).toBe('07:30');
  });

  it('moves back by the step', () => {
    expect(shiftReminderTime('07:00', -REMINDER_STEP_MINUTES)).toBe('06:30');
  });

  it('wraps past midnight rather than stopping, so the stepper never dead-ends', () => {
    expect(shiftReminderTime('23:30', REMINDER_STEP_MINUTES)).toBe('00:00');
  });

  it('wraps backwards past midnight too', () => {
    expect(shiftReminderTime('00:00', -REMINDER_STEP_MINUTES)).toBe('23:30');
  });

  it('wraps a step far larger than a day', () => {
    expect(shiftReminderTime('07:00', MINUTES_PER_DAY * 3 + 60)).toBe('08:00');
  });

  it('leaves a time it cannot read alone rather than inventing one', () => {
    expect(shiftReminderTime('later', REMINDER_STEP_MINUTES)).toBe('later');
  });
});

describe('a stored settings record', () => {
  const valid = { ...DEFAULT_SETTINGS };

  it('is rejected when a reminder is not a time, so the scheduler is never handed nonsense', () => {
    expect(isSettings({ ...valid, morningReminder: 'morning' })).toBe(false);
    expect(isSettings({ ...valid, eveningReminder: '25:00' })).toBe(false);
  });

  it('is accepted at both ends of the day', () => {
    expect(isSettings({ ...valid, morningReminder: '00:00', eveningReminder: '23:59' })).toBe(true);
  });
});
