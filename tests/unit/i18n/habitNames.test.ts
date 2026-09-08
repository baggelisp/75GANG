import { decideHabitNameKey, describeHabitTargets, resolveHabitsForMode } from '@/domain/habits';
import { HabitIdEnum } from '@/domain/habitIds';
import { CHALLENGE_MODES, ChallengeModeEnum } from '@/domain/modes';
import { el, en, translate } from '@/i18n';

const LOCALES = [
  ['en', en],
  ['el', el],
] as const;

describe('a habit name', () => {
  it.each(LOCALES)('resolves to real copy in %s, in every challenge', (_name, translations) => {
    const unresolved = CHALLENGE_MODES.flatMap((mode) =>
      resolveHabitsForMode(mode)
        .map((habit) =>
          translate(translations, decideHabitNameKey(habit), describeHabitTargets(habit)),
        )
        // A missing key comes back as the key itself, which is what would reach the screen.
        .filter((name) => name.startsWith('habits.')),
    );

    expect(unresolved).toEqual([]);
  });

  it.each(LOCALES)('leaves no placeholder unfilled in %s', (_name, translations) => {
    const unfilled = CHALLENGE_MODES.flatMap((mode) =>
      resolveHabitsForMode(mode)
        .map((habit) =>
          translate(translations, decideHabitNameKey(habit), describeHabitTargets(habit)),
        )
        .filter((name) => name.includes('{')),
    );

    expect(unfilled).toEqual([]);
  });
});

describe('a habit whose target is one', () => {
  const NOT_IN_THIS_CHALLENGE = 'the workouts rule is not in this challenge';

  const readWorkoutName = (mode: (typeof CHALLENGE_MODES)[number]): string => {
    const workouts = resolveHabitsForMode(mode).find((habit) => habit.id === HabitIdEnum.WORKOUTS);

    if (workouts === undefined) {
      return NOT_IN_THIS_CHALLENGE;
    }

    return translate(en, decideHabitNameKey(workouts), describeHabitTargets(workouts));
  };

  it('takes the singular wording rather than "1 workouts"', () => {
    expect(readWorkoutName(ChallengeModeEnum.EASY)).toBe('1 workout of 30 minutes');
  });

  it('still takes the plural wording where the target is more than one', () => {
    expect(readWorkoutName(ChallengeModeEnum.HARD)).toBe('2 workouts, 45 minutes each');
  });

  it('keeps the Hard wording exactly as Docs/rules.jpeg has it', () => {
    expect(translate(el, 'habits.workouts.name', { target: 2 })).toBe('2 προπονήσεις την ημέρα');
  });
});
