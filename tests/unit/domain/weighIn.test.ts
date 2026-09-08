import { decideHabitIsComplete } from '@/domain/completion';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';
import {
  adjustWeight,
  attachPhoto,
  clearPhoto,
  decideHasPhoto,
  decideHasWeight,
  decideIsValidWeight,
  roundWeight,
  setWeight,
  WEIGHT_STEP_KG,
} from '@/domain/weighIn';

const HARD = ChallengeModeEnum.HARD;
const A_PHOTO = 'photos/2026-09-08.jpg';

describe('decideIsValidWeight', () => {
  it.each([
    ['zero', 0, false],
    ['a negative weight', -5, false],
    ['a slipped decimal point downwards', 8.84, false],
    ['a slipped decimal point upwards', 884, false],
    ['a real weight', 88.4, true],
    ['the lowest weight allowed', 20, true],
    ['the highest weight allowed', 400, true],
    ['not a number at all', Number.NaN, false],
  ])('scores %s as valid: %s', (_description, kilograms, expected) => {
    expect(decideIsValidWeight(kilograms)).toBe(expected);
  });
});

describe('roundWeight', () => {
  it.each([
    ['three decimals', 88.437, 88.4],
    ['rounding up', 88.46, 88.5],
    ['a whole number', 88, 88],
  ])('rounds %s to one decimal', (_description, given, expected) => {
    expect(roundWeight(given)).toBe(expected);
  });
});

describe('setWeight', () => {
  it('records a valid weight to one decimal', () => {
    expect(setWeight(undefined, 88.437).weightKg).toBe(88.4);
  });

  it('leaves the record untouched when the weight is not one', () => {
    const existing: HabitRecord = { completed: false, weightKg: 88.4 };

    expect(setWeight(existing, 0).weightKg).toBe(88.4);
    expect(setWeight(existing, -3).weightKg).toBe(88.4);
  });

  it('keeps the photo already attached', () => {
    const withPhoto: HabitRecord = { completed: false, photo: A_PHOTO };

    expect(setWeight(withPhoto, 88.4).photo).toBe(A_PHOTO);
  });
});

describe('adjustWeight', () => {
  it('steps up by a tenth', () => {
    expect(adjustWeight({ completed: false, weightKg: 88.4 }, WEIGHT_STEP_KG).weightKg).toBe(88.5);
  });

  it('steps down by a tenth', () => {
    expect(adjustWeight({ completed: false, weightKg: 88.4 }, -WEIGHT_STEP_KG).weightKg).toBe(88.3);
  });

  it('does not accumulate floating point dust across many steps', () => {
    const stepped = Array.from({ length: 10 }).reduce<HabitRecord>(
      (record) => adjustWeight(record, WEIGHT_STEP_KG),
      { completed: false, weightKg: 88 },
    );

    expect(stepped.weightKg).toBe(89);
  });

  it('will not step below the lowest weight allowed', () => {
    expect(adjustWeight({ completed: false, weightKg: 20 }, -WEIGHT_STEP_KG).weightKg).toBe(20);
  });
});

describe('the photo', () => {
  it('stores the path, never the image', () => {
    const attached = attachPhoto(undefined, A_PHOTO);

    expect(attached.photo).toBe(A_PHOTO);
    expect(JSON.stringify(attached).length).toBeLessThan(120);
  });

  it('can be cleared when the wrong one was picked', () => {
    expect(decideHasPhoto(clearPhoto(attachPhoto(undefined, A_PHOTO)))).toBe(false);
  });

  it('keeps the weight already recorded', () => {
    const withWeight: HabitRecord = { completed: false, weightKg: 88.4 };

    expect(attachPhoto(withWeight, A_PHOTO).weightKg).toBe(88.4);
  });
});

describe('rule 9 needs both', () => {
  it('is incomplete with a weight and no photo', () => {
    const record = setWeight(undefined, 88.4);

    expect(decideHasWeight(record)).toBe(true);
    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record, HARD)).toBe(false);
  });

  it('is incomplete with a photo and no weight', () => {
    const record = attachPhoto(undefined, A_PHOTO);

    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record, HARD)).toBe(false);
  });

  it('is complete with both', () => {
    const record = attachPhoto(setWeight(undefined, 88.4), A_PHOTO);

    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record, HARD)).toBe(true);
  });

  it('is incomplete again once the photo is cleared', () => {
    const record = clearPhoto(attachPhoto(setWeight(undefined, 88.4), A_PHOTO));

    expect(decideHabitIsComplete(HabitIdEnum.WEIGH_IN, record, HARD)).toBe(false);
  });
});
