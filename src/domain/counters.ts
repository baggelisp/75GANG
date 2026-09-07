import { Habit } from './habits';
import { TargetType, TargetTypeEnum } from './targets';
import { HabitRecord } from './types';

export type CounterStep = {
  /** How much the step adds, in the habit's own unit. */
  readonly amount: number;
  /** Translation key for the button label. */
  readonly labelKey: string;
};

export type CounterDefinition = {
  readonly steps: readonly CounterStep[];
  /** The single step Undo takes back off. Fixed, not a history of what was tapped. */
  readonly undo: CounterStep;
  /** Decimal places the value is rounded to, so a step that is not a power of two cannot drift. */
  readonly precision: number;
};

/**
 * The counters, keyed by target type so a new one is an entry here rather than a branch on a
 * habit's name.
 *
 * Typed against every `TargetType`: a target type with no counter is `null`, stated explicitly, so
 * adding a target type without deciding this is a compile error rather than an empty screen.
 */
const COUNTERS_BY_TARGET_TYPE: Readonly<Record<TargetType, CounterDefinition | null>> = {
  [TargetTypeEnum.BOOLEAN]: null,
  [TargetTypeEnum.SESSIONS]: null,
  [TargetTypeEnum.WINDOWS]: null,
  [TargetTypeEnum.MEASUREMENT]: null,
  [TargetTypeEnum.LITRES]: {
    steps: [
      { amount: 0.25, labelKey: 'counter.plus250ml' },
      { amount: 0.5, labelKey: 'counter.plus500ml' },
      { amount: 1, labelKey: 'counter.plus1l' },
    ],
    undo: { amount: -0.25, labelKey: 'counter.minus250ml' },
    precision: 2,
  },
  [TargetTypeEnum.PAGES]: {
    steps: [
      { amount: 1, labelKey: 'counter.plus1page' },
      { amount: 5, labelKey: 'counter.plus5pages' },
    ],
    undo: { amount: -1, labelKey: 'counter.minus1page' },
    precision: 0,
  },
  [TargetTypeEnum.MINUTES]: null,
};

export const findCounter = (habit: Habit): CounterDefinition | null =>
  COUNTERS_BY_TARGET_TYPE[habit.targetType];

export const decideIsCounter = (habit: Habit): boolean => findCounter(habit) !== null;

const roundCounterValue = (value: number, precision: number): number => {
  const scale = 10 ** precision;

  return Math.round(value * scale) / scale;
};

const readCurrent = (record: HabitRecord | undefined): number => {
  if (record === undefined || typeof record.value !== 'number') {
    return 0;
  }

  return record.value;
};

/**
 * Adds to a counter.
 *
 * A value above the target is kept rather than clamped: someone who drank four litres drank four
 * litres, and hiding it would make the number on screen a lie. Completion is decided separately by
 * the habit's own rule, and the day percentage counts habits rather than units, so an overshoot
 * cannot push a day past a hundred percent.
 *
 * The floor is zero, so undoing past empty cannot record a negative amount.
 */
export const applyCounterStep = (
  record: HabitRecord | undefined,
  amount: number,
  precision: number,
): HabitRecord => {
  const next = readCurrent(record) + amount;
  const floored = next < 0 ? 0 : next;

  return {
    ...(record ?? { completed: false }),
    value: roundCounterValue(floored, precision),
  };
};
