/**
 * Time as a dependency. The domain never reads the clock, so every calculation can be tested at
 * an exact instant instead of whenever the suite happens to run.
 */
export type Clock = {
  now(): Date;
};
