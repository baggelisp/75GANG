import { convertEmToPoints, typography } from '@/theme/typography';

const NUMERIC_ROLES = ['hero', 'tileValue', 'statValue', 'legendValue', 'ruleMeta'] as const;

describe('convertEmToPoints', () => {
  it.each([
    ['positive tracking on a section label', 0.13, 11, 1.43],
    ['wide tracking on a kicker', 0.14, 10, 1.4],
    ['tight negative tracking on the hero', -0.045, 40, -1.8],
    ['no tracking', 0, 12.5, 0],
  ])('converts %s', (_description, em, fontSize, expected) => {
    expect(convertEmToPoints(em, fontSize)).toBe(expected);
  });
});

describe('typography', () => {
  it('defines exactly the eleven roles from the design system', () => {
    expect(Object.keys(typography)).toHaveLength(11);
  });

  it.each(NUMERIC_ROLES)('gives %s tabular numbers so digits do not jitter', (role) => {
    expect(typography[role].fontVariant).toEqual(['tabular-nums']);
  });

  it.each([
    ['kicker', 1.4],
    ['sectionLabel', 1.43],
    ['microLabel', 0.95],
    ['greeting', -0.81],
    ['hero', -1.8],
    ['tileValue', -1.05],
    ['statValue', -0.78],
    ['legendValue', -0.4],
  ] as const)('converts the em tracking of %s to %s points', (role, expected) => {
    expect(typography[role].letterSpacing).toBe(expected);
  });

  it.each(['kicker', 'sectionLabel', 'microLabel', 'greeting', 'tabLabel'] as const)(
    'uppercases %s',
    (role) => {
      expect(typography[role].textTransform).toBe('uppercase');
    },
  );
});
