import { EASY_WATER_TARGET_LITRES, WATER_TARGET_LITRES } from '@/domain/targets';
import { el, en, LocaleEnum, translate } from '@/i18n';

describe('translate', () => {
  it('resolves a dotted key against the locale', () => {
    expect(translate(en, 'common.save')).toBe('Save');
  });

  it('resolves a habit name by habit id, with the target of the challenge in hand', () => {
    // The rules are the same in every challenge; the numbers are not.
    expect(translate(en, 'habits.water.name', { target: WATER_TARGET_LITRES })).toBe(
      'Drink 3 litres of water',
    );
    expect(translate(en, 'habits.water.name', { target: EASY_WATER_TARGET_LITRES })).toBe(
      'Drink 2 litres of water',
    );
  });

  it('interpolates values into a template', () => {
    expect(translate(en, 'today.dayOf', { day: 12, total: 75 })).toBe('Day 12 of 75');
  });

  it('leaves a placeholder alone when no value is supplied, rather than printing undefined', () => {
    expect(translate(en, 'today.greeting')).toBe('Hey, {name}');
  });

  it('returns the key itself for a missing one, so the break is visible on screen', () => {
    expect(translate(en, 'today.doesNotExist')).toBe('today.doesNotExist');
  });

  it('returns the key rather than an object when the path stops short of a string', () => {
    expect(translate(en, 'habits.water')).toBe('habits.water');
  });

  it('falls back to English for a key the Greek locale has not translated yet', () => {
    const partial = { ...el, common: { ...el.common, save: undefined } } as unknown as typeof en;

    expect(translate(partial, 'common.save')).toBe('Save');
  });
});

describe('the Greek locale', () => {
  it('keeps the original rule wording verbatim, so the rules cannot drift', () => {
    expect(translate(el, 'habits.diet.description')).toContain('ούτε ένα cheat meal');
    expect(translate(el, 'habits.morning-detox.description')).toContain('3 ώρες');
  });

  it('covers the same locales the app offers', () => {
    expect(Object.values(LocaleEnum)).toEqual(['en', 'el']);
  });
});

describe('every habit has copy in both locales', () => {
  it.each(Object.keys(en.habits))('translates %s in English and Greek', (habitId) => {
    expect(translate(en, `habits.${habitId}.name`)).not.toBe(`habits.${habitId}.name`);
    expect(translate(el, `habits.${habitId}.name`)).not.toBe(`habits.${habitId}.name`);
  });
});

describe('translation copy style', () => {
  const collectStrings = (source: unknown): string[] => {
    if (typeof source === 'string') {
      return [source];
    }

    if (source === null || typeof source !== 'object') {
      return [];
    }

    return Object.values(source as Record<string, unknown>).flatMap(collectStrings);
  };

  it.each([
    ['English', en],
    ['Greek', el],
  ])('uses no em dashes in %s', (_name, locale) => {
    const offenders = collectStrings(locale).filter((text) => text.includes('—'));

    expect(offenders).toEqual([]);
  });
});
