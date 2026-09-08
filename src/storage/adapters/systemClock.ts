import { Clock } from '@/storage/ports/clock';

/** The only module allowed to construct a Date from the machine's clock. */
export const createSystemClock = (): Clock => ({
  now: () => new Date(),
});
