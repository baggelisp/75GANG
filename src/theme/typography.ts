import { TextStyle } from 'react-native';

/**
 * React Native has no `em` unit for letter spacing, so the design system's `em` tracking is
 * converted to points here, once, at the role's own size.
 */
export const convertEmToPoints = (em: number, fontSize: number): number =>
  Math.round(em * fontSize * 100) / 100;

export const fontFamilies = {
  displaySemiBold: 'Archivo_600SemiBold',
  displayBold: 'Archivo_700Bold',
  displayExtraBold: 'Archivo_800ExtraBold',
  bodyRegular: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

const TABULAR_NUMBERS: TextStyle['fontVariant'] = ['tabular-nums'];

const UPPERCASE: TextStyle['textTransform'] = 'uppercase';

/**
 * The eleven type roles from `.claude/rules/design-system.md`. Nothing outside this file sets a
 * font size, weight or letter spacing — `tests/unit/designSystem.test.ts` enforces that.
 */
export const typography = {
  kicker: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 10,
    letterSpacing: convertEmToPoints(0.14, 10),
    textTransform: UPPERCASE,
  },
  sectionLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 11,
    letterSpacing: convertEmToPoints(0.13, 11),
    textTransform: UPPERCASE,
  },
  microLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 9.5,
    letterSpacing: convertEmToPoints(0.1, 9.5),
    textTransform: UPPERCASE,
  },
  greeting: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 27,
    letterSpacing: convertEmToPoints(-0.03, 27),
    textTransform: UPPERCASE,
  },
  hero: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 40,
    letterSpacing: convertEmToPoints(-0.045, 40),
    fontVariant: TABULAR_NUMBERS,
  },
  tileValue: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 30,
    letterSpacing: convertEmToPoints(-0.035, 30),
    fontVariant: TABULAR_NUMBERS,
  },
  statValue: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 26,
    letterSpacing: convertEmToPoints(-0.03, 26),
    fontVariant: TABULAR_NUMBERS,
  },
  legendValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    letterSpacing: convertEmToPoints(-0.02, 20),
    fontVariant: TABULAR_NUMBERS,
  },
  ruleName: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12.5,
  },
  ruleMeta: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10.5,
    fontVariant: TABULAR_NUMBERS,
  },
  tabLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 9.5,
    letterSpacing: convertEmToPoints(0.1, 9.5),
    textTransform: UPPERCASE,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyRole = keyof typeof typography;
