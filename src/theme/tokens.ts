/**
 * The only module in the repository allowed to contain a colour literal, including `rgba()`.
 *
 * Values come from `.claude/rules/design-system.md`, which takes them from
 * `Docs/mockups/home-screen.html`. `tests/unit/designSystem.test.ts` enforces this file's
 * monopoly.
 *
 * `app.json` repeats the background colour for the native splash and adaptive icon. Expo's config
 * cannot read a TypeScript module, so that duplication is unavoidable and is whitelisted by the
 * guard rather than fixed.
 */
export const colors = {
  // Surfaces
  bg: '#1A191C',
  card: '#252429',
  raised: '#2E2D33',
  hairline: 'rgba(255, 255, 255, 0.07)',
  outline: 'rgba(255, 255, 255, 0.16)',

  // Text
  text: '#F4F3F6',
  textSecondary: '#9A98A1',
  textTertiary: '#6E6C76',
  ink: '#1A1712',

  // Accents — three only. No green, no blue, no fourth colour.
  coral: '#EE9080',
  butter: '#F1DD79',
  lavender: '#A6ADED',
} as const;

export const AccentEnum = {
  CORAL: 'coral',
  BUTTER: 'butter',
  LAVENDER: 'lavender',
} as const;

export type Accent = (typeof AccentEnum)[keyof typeof AccentEnum];

export const ACCENTS: readonly Accent[] = [
  AccentEnum.CORAL,
  AccentEnum.BUTTER,
  AccentEnum.LAVENDER,
];

export const resolveAccentColor = (accent: Accent): string => colors[accent];
