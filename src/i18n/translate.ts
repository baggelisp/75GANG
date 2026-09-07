import { en, Translations } from './locales/en';

export const LocaleEnum = {
  EN: 'en',
  EL: 'el',
} as const;

export type Locale = (typeof LocaleEnum)[keyof typeof LocaleEnum];

export type TranslationValues = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

const readPath = (source: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== 'object') {
      return null;
    }

    return (current as Record<string, unknown>)[segment] ?? null;
  }, source);

const interpolate = (template: string, values: TranslationValues | null): string => {
  if (values === null) {
    return template;
  }

  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = values[name];

    if (value === undefined) {
      return match;
    }

    return String(value);
  });
};

/**
 * Resolves a dotted key against a locale, falling back to English.
 *
 * A missing key returns the key itself rather than an empty string: a screen showing
 * `today.sectionRules` is obviously broken, while a blank space looks like a design decision and
 * ships.
 */
export const translate = (
  translations: Translations,
  key: string,
  values: TranslationValues | null = null,
): string => {
  const path = key.split('.');
  const found = readPath(translations, path) ?? readPath(en, path);

  if (typeof found !== 'string') {
    return key;
  }

  return interpolate(found, values);
};
