const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const PAD = 2;

const pad = (value: number): string => `${value}`.padStart(PAD, '0');

/**
 * Minutes as a clock reading. Always shows minutes and seconds, and hours only once there are any,
 * so a fifteen minute timer does not carry a permanent leading zero.
 */
export const formatDuration = (minutes: number): string => {
  const safeMinutes = minutes < 0 ? 0 : minutes;
  const totalSeconds = Math.floor(safeMinutes * SECONDS_PER_MINUTE);
  const hours = Math.floor(totalSeconds / (MINUTES_PER_HOUR * SECONDS_PER_MINUTE));
  const remainingMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (hours === 0) {
    return `${pad(remainingMinutes)}:${pad(seconds)}`;
  }

  return `${hours}:${pad(remainingMinutes)}:${pad(seconds)}`;
};
