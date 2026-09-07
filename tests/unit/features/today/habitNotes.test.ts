import { HABITS } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { CHALLENGE_MODES } from '@/domain/modes';
import { el, en, translate } from '@/i18n';
import { describeHabitNote } from '@/features/today/describeHabitNote';

const findHabit = (habitId: string) => {
  const habit = HABITS.find((candidate) => candidate.id === habitId);

  if (habit === undefined) {
    throw new Error(`${habitId} is not a habit`);
  }

  return habit;
};

describe('describeHabitNote', () => {
  it('gives the diet rule its cut-off, which the checkbox cannot express', () => {
    expect(describeHabitNote(findHabit(HabitIdEnum.DIET))).toBe('habits.diet.note');
  });

  it('gives the bedtime rule its own reminder', () => {
    expect(describeHabitNote(findHabit(HabitIdEnum.NO_DEVICES_BED))).toBe(
      'habits.no-devices-bed.note',
    );
  });

  it('says nothing for a rule that needs no reminder', () => {
    expect(describeHabitNote(findHabit(HabitIdEnum.NO_ALCOHOL))).toBeNull();
  });
});

/**
 * A missing key renders as the raw key on screen. Pinning the contract here means a habit can
 * never declare a note that does not exist in a locale.
 */
describe('every declared note exists in both locales', () => {
  const habitsWithNotes = HABITS.filter((habit) => habit.noteKey !== null);

  it('declares at least one note, so this test cannot pass vacuously', () => {
    expect(habitsWithNotes.length).toBeGreaterThan(0);
  });

  it.each(habitsWithNotes.map((habit) => [habit.id, habit.noteKey ?? '']))(
    'translates the note for %s',
    (_habitId, noteKey) => {
      expect(translate(en, noteKey)).not.toBe(noteKey);
      expect(translate(el, noteKey)).not.toBe(noteKey);
    },
  );

  it('covers every challenge, since a note travels with its habit', () => {
    expect(CHALLENGE_MODES.length).toBe(3);
  });
});
