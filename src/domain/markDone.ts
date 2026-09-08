import { HabitRecord } from './types';

/**
 * Marking a rule done by hand.
 *
 * Every other rule in this app derives completion from what was recorded, on purpose: a stored
 * flag that disagrees with the numbers is how a streak gets claimed that nobody earned. This is
 * the one deliberate exception, and it exists because some rules cannot be caught up after the
 * fact. You cannot retroactively start the morning detox at seven o'clock, and losing a perfect
 * day for forgetting to press a button is punishing bookkeeping rather than discipline.
 *
 * It is kept honest by being visible: `decideIsMarkedDone` lets the screen say the rule was marked
 * by hand rather than met, and taking the mark off returns the rule to whatever the numbers say.
 */
export const markDone = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  markedDone: true,
});

export const clearMarkedDone = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  markedDone: false,
});

export const decideIsMarkedDone = (record: HabitRecord | undefined): boolean =>
  record?.markedDone === true;
