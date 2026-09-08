import { useMemo } from 'react';

import { el } from './locales/el';
import { en, Translations } from './locales/en';
import { Locale, LocaleEnum, translate, TranslationValues } from './translate';

const TRANSLATIONS_BY_LOCALE: Readonly<Record<Locale, Translations>> = {
  [LocaleEnum.EN]: en,
  [LocaleEnum.EL]: el,
};

export type Translate = (key: string, values?: TranslationValues) => string;

/**
 * The hook every component uses for copy. The MVP ships English; the locale argument exists so
 * feature work never hardcodes a string on the way to supporting Greek.
 */
export const useTranslation = (
  locale: Locale = LocaleEnum.EN,
): { t: Translate; locale: Locale } => {
  const translations = TRANSLATIONS_BY_LOCALE[locale];

  const t = useMemo<Translate>(
    () => (key, values) => translate(translations, key, values ?? null),
    [translations],
  );

  return { t, locale };
};
