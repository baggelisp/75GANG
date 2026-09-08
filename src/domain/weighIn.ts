import { HabitRecord } from './types';

export const WEIGHT_STEP_KG = 0.1;
export const MINIMUM_WEIGHT_KG = 20;
export const MAXIMUM_WEIGHT_KG = 400;

const DECIMALS = 10;

/**
 * A weight the app is willing to record.
 *
 * Zero and negatives are not weights, and the bounds keep a slipped decimal point out of the
 * record — 8.84 kg and 884 kg are both far more likely to be a typo than a person.
 */
export const decideIsValidWeight = (kilograms: number): boolean => {
  if (!Number.isFinite(kilograms)) {
    return false;
  }

  return kilograms >= MINIMUM_WEIGHT_KG && kilograms <= MAXIMUM_WEIGHT_KG;
};

/** Rounded to one decimal, which is the precision a bathroom scale actually offers. */
export const roundWeight = (kilograms: number): number =>
  Math.round(kilograms * DECIMALS) / DECIMALS;

export const setWeight = (record: HabitRecord | undefined, kilograms: number): HabitRecord => {
  const rounded = roundWeight(kilograms);

  if (!decideIsValidWeight(rounded)) {
    return record ?? { completed: false };
  }

  return { ...(record ?? { completed: false }), weightKg: rounded };
};

export const adjustWeight = (record: HabitRecord | undefined, delta: number): HabitRecord => {
  const current = typeof record?.weightKg === 'number' ? record.weightKg : MINIMUM_WEIGHT_KG;

  return setWeight(record, current + delta);
};

/** The record stores the path. The image itself never enters a day record. */
export const attachPhoto = (record: HabitRecord | undefined, path: string): HabitRecord => ({
  ...(record ?? { completed: false }),
  photo: path,
});

export const clearPhoto = (record: HabitRecord | undefined): HabitRecord => ({
  ...(record ?? { completed: false }),
  photo: null,
});

export const decideHasWeight = (record: HabitRecord | undefined): boolean =>
  typeof record?.weightKg === 'number';

export const decideHasPhoto = (record: HabitRecord | undefined): boolean =>
  typeof record?.photo === 'string' && record.photo.length > 0;
