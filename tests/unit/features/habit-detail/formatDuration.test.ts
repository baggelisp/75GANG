import { formatDuration } from '@/features/habit-detail/formatDuration';

describe('formatDuration', () => {
  it.each([
    ['nothing yet', 0, '00:00'],
    ['half a minute', 0.5, '00:30'],
    ['a whole minute', 1, '01:00'],
    ['a quarter of an hour', 15, '15:00'],
    ['forty five minutes', 45, '45:00'],
    ['fifty nine minutes', 59, '59:00'],
  ])('shows %s as %s', (_description, minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it('adds hours only once there are any, so short timers stay short', () => {
    expect(formatDuration(60)).toBe('1:00:00');
    expect(formatDuration(185)).toBe('3:05:00');
  });

  it('reads zero rather than a negative clock', () => {
    expect(formatDuration(-5)).toBe('00:00');
  });

  it('truncates part-seconds rather than rounding a timer forward', () => {
    expect(formatDuration(0.999 / 60)).toBe('00:00');
  });
});
